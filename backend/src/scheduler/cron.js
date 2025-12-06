const cron = require('node-cron');
const shopifyService = require('../modules/shopify/shopify.service');

const startScheduler = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Starting scheduled data sync...');
    try {
      const results = await shopifyService.syncAllTenants();
      console.log('[CRON] Sync completed:', results);
    } catch (error) {
      console.error('[CRON] Sync failed:', error.message);
    }
  });

  console.log('[CRON] Scheduler started - syncing every 10 minutes');
};

module.exports = { startScheduler };
