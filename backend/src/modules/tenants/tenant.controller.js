const tenantService = require('./tenant.service');
const { successResponse } = require('../../utils/response');

const registerShopify = async (req, res, next) => {
  try {
    const { shopifyDomain, shopifyToken } = req.body;
    
    if (!shopifyDomain || !shopifyToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Shopify domain and access token are required' 
      });
    }

    const tenant = await tenantService.registerShopifyStore(
      req.tenantId,
      shopifyDomain,
      shopifyToken
    );

    successResponse(res, tenant, 'Shopify store registered successfully');
  } catch (error) {
    next(error);
  }
};

const getCurrentTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.tenantId);
    successResponse(res, tenant);
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const { name, shopifyDomain, shopifyToken } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (shopifyDomain) updateData.shopifyDomain = shopifyDomain;
    if (shopifyToken) updateData.shopifyToken = shopifyToken;

    const tenant = await tenantService.updateTenant(req.tenantId, updateData);
    successResponse(res, tenant, 'Tenant updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { registerShopify, getCurrentTenant, updateTenant };
