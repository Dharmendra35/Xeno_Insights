const express = require('express');
const router = express.Router();
const shopifyService = require('./shopify.service');
const webhookHandler = require('./webhook.handler');
const { authMiddleware } = require('../../middleware/auth');
const { successResponse } = require('../../utils/response');

// Webhook endpoint (no auth - Shopify calls this)
router.post('/webhook', webhookHandler.handleWebhook);

// Manual data ingestion
router.post('/ingest/:tenant_id', authMiddleware, async (req, res, next) => {
  try {
    const result = await shopifyService.syncTenantData(req.params.tenant_id);
    successResponse(res, result, 'Data sync completed');
  } catch (error) {
    next(error);
  }
});

// Sync current tenant's data
router.post('/sync', authMiddleware, async (req, res, next) => {
  try {
    const result = await shopifyService.syncTenantData(req.tenantId);
    successResponse(res, result, 'Data sync completed');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
