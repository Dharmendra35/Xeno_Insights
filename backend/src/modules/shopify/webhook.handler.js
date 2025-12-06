const { PrismaClient } = require('@prisma/client');
const { successResponse } = require('../../utils/response');

const prisma = new PrismaClient();

const handleWebhook = async (req, res, next) => {
  try {
    const topic = req.headers['x-shopify-topic'];
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const payload = req.body;

    console.log(`Webhook received: ${topic} from ${shopDomain}`);

    // Find tenant by shop domain
    const tenant = await prisma.tenant.findFirst({
      where: { shopifyDomain: shopDomain }
    });

    if (!tenant) {
      console.log(`No tenant found for domain: ${shopDomain}`);
      return res.status(200).json({ received: true });
    }

    // Log the event
    await prisma.event.create({
      data: {
        tenantId: tenant.id,
        eventType: `WEBHOOK_${topic?.toUpperCase().replace('/', '_')}`,
        payload
      }
    });

    // Handle specific webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(tenant.id, payload);
        break;
      case 'customers/create':
      case 'customers/update':
        await handleCustomerWebhook(tenant.id, payload);
        break;
      case 'products/create':
      case 'products/update':
        await handleProductWebhook(tenant.id, payload);
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true }); // Always return 200 to Shopify
  }
};

const handleOrderWebhook = async (tenantId, order) => {
  await prisma.order.upsert({
    where: {
      shopifyId_tenantId: {
        shopifyId: String(order.id),
        tenantId
      }
    },
    update: {
      orderNumber: order.order_number?.toString(),
      email: order.email,
      totalPrice: parseFloat(order.total_price) || 0,
      currency: order.currency,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      customerShopifyId: order.customer?.id?.toString(),
      orderDate: order.created_at ? new Date(order.created_at) : null
    },
    create: {
      shopifyId: String(order.id),
      tenantId,
      orderNumber: order.order_number?.toString(),
      email: order.email,
      totalPrice: parseFloat(order.total_price) || 0,
      currency: order.currency,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      customerShopifyId: order.customer?.id?.toString(),
      orderDate: order.created_at ? new Date(order.created_at) : null
    }
  });
};

const handleCustomerWebhook = async (tenantId, customer) => {
  await prisma.customer.upsert({
    where: {
      shopifyId_tenantId: {
        shopifyId: String(customer.id),
        tenantId
      }
    },
    update: {
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      totalSpent: parseFloat(customer.total_spent) || 0,
      ordersCount: customer.orders_count || 0
    },
    create: {
      shopifyId: String(customer.id),
      tenantId,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      totalSpent: parseFloat(customer.total_spent) || 0,
      ordersCount: customer.orders_count || 0
    }
  });
};

const handleProductWebhook = async (tenantId, product) => {
  const variant = product.variants?.[0];
  await prisma.product.upsert({
    where: {
      shopifyId_tenantId: {
        shopifyId: String(product.id),
        tenantId
      }
    },
    update: {
      title: product.title,
      description: product.body_html,
      vendor: product.vendor,
      productType: product.product_type,
      price: parseFloat(variant?.price) || 0,
      inventory: variant?.inventory_quantity || 0
    },
    create: {
      shopifyId: String(product.id),
      tenantId,
      title: product.title,
      description: product.body_html,
      vendor: product.vendor,
      productType: product.product_type,
      price: parseFloat(variant?.price) || 0,
      inventory: variant?.inventory_quantity || 0
    }
  });
};

module.exports = { handleWebhook };
