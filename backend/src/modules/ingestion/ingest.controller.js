const ingestService = require('./ingest.service');
const { successResponse } = require('../../utils/response');

const ingestData = async (req, res, next) => {
  try {
    const tenantId = req.params.tenant_id || req.tenantId;
    const result = await ingestService.ingestAllData(tenantId);
    successResponse(res, result, 'Data ingestion completed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { ingestData };
