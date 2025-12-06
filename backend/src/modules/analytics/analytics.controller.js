const analyticsService = require('./analytics.service');
const { successResponse } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary(req.tenantId);
    successResponse(res, summary);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const result = await analyticsService.getOrdersByDateRange(req.tenantId, start, end);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const getTopCustomers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const customers = await analyticsService.getTopCustomers(req.tenantId, limit);
    successResponse(res, customers);
  } catch (error) {
    next(error);
  }
};

const getRevenueByMonth = async (req, res, next) => {
  try {
    const data = await analyticsService.getRevenueByMonth(req.tenantId);
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = await analyticsService.getEvents(req.tenantId, limit);
    successResponse(res, events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getOrders,
  getTopCustomers,
  getRevenueByMonth,
  getEvents
};
