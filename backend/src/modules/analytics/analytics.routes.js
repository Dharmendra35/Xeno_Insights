const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/summary', analyticsController.getSummary);
router.get('/orders', analyticsController.getOrders);
router.get('/top-customers', analyticsController.getTopCustomers);
router.get('/revenue-by-month', analyticsController.getRevenueByMonth);
router.get('/events', analyticsController.getEvents);

module.exports = router;
