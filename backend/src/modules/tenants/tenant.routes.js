const express = require('express');
const router = express.Router();
const tenantController = require('./tenant.controller');
const { authMiddleware } = require('../../middleware/auth');
const { shopifyValidation } = require('../../middleware/validate');

router.post('/register', authMiddleware, shopifyValidation, tenantController.registerShopify);
router.get('/me', authMiddleware, tenantController.getCurrentTenant);
router.put('/update', authMiddleware, tenantController.updateTenant);

module.exports = router;
