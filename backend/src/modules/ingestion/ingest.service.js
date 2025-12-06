const { PrismaClient } = require('@prisma/client');
const { createShopifyClient } = require('../../config/shopify');
const { AppError } = require('../../utils/error');

const prisma = new PrismaClient();

const ingestCustomers = async (tenantId, shopifyDomain, shopifyToken) => {
  const shopify = createShopifyClient(shopifyDomain, shopifyToken);
  const customers = await shopify.getCustomers();

  const upsertPromises = customers.map(customer =>
    prisma.customer.upsert({
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
    })
  );

  await Promise.all(upsertPromises);
  return customers.length;
};

const ingestOrders = async (tenantId, shopifyDomain, shopifyToken) => {
  const shopify = createShopifyClient(shopifyDomain, shopifyToken);
  const orders = await shopify.getOrders();

  const upsertPromises = orders.map(order =>
    prisma.order.upsert({
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
    })
  );

  await Promise.all(upsertPromises);
  return orders.length;
};

const ingestProducts = async (tenantId, shopifyDomain, shopifyToken) => {
  const shopify = createShopifyClient(shopifyDomain, shopifyToken);
  const products = await shopify.getProducts();

  const upsertPromises = products.map(product => {
    const variant = product.variants?.[0];
    return prisma.product.upsert({
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
  });

  await Promise.all(upsertPromises);
  return products.length;
};

const ingestAllData = async (tenantId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { shopifyDomain: true, shopifyToken: true }
  });

  if (!tenant?.shopifyDomain || !tenant?.shopifyToken) {
    throw new AppError('Shopify store not configured for this tenant', 400);
  }

  const [customersCount, ordersCount, productsCount] = await Promise.all([
    ingestCustomers(tenantId, tenant.shopifyDomain, tenant.shopifyToken),
    ingestOrders(tenantId, tenant.shopifyDomain, tenant.shopifyToken),
    ingestProducts(tenantId, tenant.shopifyDomain, tenant.shopifyToken)
  ]);

  // Log event
  await prisma.event.create({
    data: {
      tenantId,
      eventType: 'DATA_SYNC',
      payload: { customersCount, ordersCount, productsCount, timestamp: new Date() }
    }
  });

  return { customersCount, ordersCount, productsCount };
};

module.exports = {
  ingestCustomers,
  ingestOrders,
  ingestProducts,
  ingestAllData
};
