const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../utils/error');

const prisma = new PrismaClient();

const registerShopifyStore = async (tenantId, shopifyDomain, shopifyToken) => {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { shopifyDomain, shopifyToken }
  });

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    shopifyDomain: tenant.shopifyDomain
  };
};

const getTenantById = async (tenantId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      shopifyDomain: true,
      createdAt: true
    }
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return tenant;
};

const updateTenant = async (tenantId, data) => {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      shopifyDomain: true
    }
  });

  return tenant;
};

const getAllTenantsWithShopify = async () => {
  return prisma.tenant.findMany({
    where: {
      shopifyDomain: { not: null },
      shopifyToken: { not: null }
    },
    select: {
      id: true,
      shopifyDomain: true,
      shopifyToken: true
    }
  });
};

module.exports = {
  registerShopifyStore,
  getTenantById,
  updateTenant,
  getAllTenantsWithShopify
};
