const { PrismaClient } = require('@prisma/client');
const ingestService = require('../ingestion/ingest.service');
const tenantService = require('../tenants/tenant.service');

const prisma = new PrismaClient();

const syncTenantData = async (tenantId) => {
  return ingestService.ingestAllData(tenantId);
};

const syncAllTenants = async () => {
  const tenants = await tenantService.getAllTenantsWithShopify();
  const results = [];

  for (const tenant of tenants) {
    try {
      const result = await ingestService.ingestAllData(tenant.id);
      results.push({ tenantId: tenant.id, success: true, ...result });
    } catch (error) {
      console.error(`Sync failed for tenant ${tenant.id}:`, error.message);
      results.push({ tenantId: tenant.id, success: false, error: error.message });
    }
  }

  return results;
};

module.exports = { syncTenantData, syncAllTenants };
