const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (tenantId) => {
  const [customersCount, ordersCount, productsCount, revenueResult] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.order.aggregate({
      where: { tenantId },
      _sum: { totalPrice: true }
    })
  ]);

  return {
    totalCustomers: customersCount,
    totalOrders: ordersCount,
    totalProducts: productsCount,
    totalRevenue: revenueResult._sum.totalPrice || 0
  };
};

const getOrdersByDateRange = async (tenantId, startDate, endDate) => {
  const where = { tenantId };
  
  if (startDate || endDate) {
    where.orderDate = { not: null };
    if (startDate) {
      where.orderDate.gte = new Date(startDate);
    }
    if (endDate) {
      // Add one day to include the entire end date
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.orderDate.lt = end;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { orderDate: 'desc' },
    select: {
      id: true,
      shopifyId: true,
      orderNumber: true,
      email: true,
      totalPrice: true,
      currency: true,
      financialStatus: true,
      fulfillmentStatus: true,
      orderDate: true,
      createdAt: true
    }
  });

  // Group by date for chart data (use createdAt as fallback)
  const ordersByDate = orders.reduce((acc, order) => {
    const date = order.orderDate || order.createdAt;
    if (date) {
      const dateKey = new Date(date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, count: 0, revenue: 0 };
      }
      acc[dateKey].count += 1;
      acc[dateKey].revenue += order.totalPrice || 0;
    }
    return acc;
  }, {});

  return {
    orders,
    chartData: Object.values(ordersByDate).sort((a, b) => a.date.localeCompare(b.date))
  };
};

const getTopCustomers = async (tenantId, limit = 5) => {
  const customers = await prisma.customer.findMany({
    where: { tenantId },
    orderBy: { totalSpent: 'desc' },
    take: limit,
    select: {
      id: true,
      shopifyId: true,
      email: true,
      firstName: true,
      lastName: true,
      totalSpent: true,
      ordersCount: true
    }
  });

  return customers;
};

const getRevenueByMonth = async (tenantId) => {
  const orders = await prisma.order.findMany({
    where: { tenantId },
    select: { orderDate: true, totalPrice: true }
  });

  const revenueByMonth = orders.reduce((acc, order) => {
    if (order.orderDate) {
      const monthKey = order.orderDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, revenue: 0, orders: 0 };
      }
      acc[monthKey].revenue += order.totalPrice || 0;
      acc[monthKey].orders += 1;
    }
    return acc;
  }, {});

  return Object.values(revenueByMonth).sort((a, b) => a.month.localeCompare(b.month));
};

const getEvents = async (tenantId, limit = 50) => {
  return prisma.event.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

module.exports = {
  getSummary,
  getOrdersByDateRange,
  getTopCustomers,
  getRevenueByMonth,
  getEvents
};
