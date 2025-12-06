const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { frontendUrl, nodeEnv } = require('./config/env');
const { errorHandler } = require('./utils/error');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const tenantRoutes = require('./modules/tenants/tenant.routes');
const shopifyRoutes = require('./modules/shopify/shopify.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

app.set('trust proxy', 1); // Required for reverse proxies like Render

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: nodeEnv === 'production' ? 100 : 1000, // limit requests per window
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/auth', limiter);

// CORS
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000', 'https://xeno-insights-six.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Xeno Insights API is running', version: '1.0.0' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/shopify', shopifyRoutes);
app.use('/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
