const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }
  next();
};

const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const shopifyValidation = [
  body('shopifyDomain')
    .trim()
    .notEmpty().withMessage('Shopify domain is required')
    .matches(/^[a-zA-Z0-9-]+\.myshopify\.com$/).withMessage('Invalid Shopify domain format (e.g., your-store.myshopify.com)'),
  body('shopifyToken')
    .trim()
    .notEmpty().withMessage('Shopify access token is required')
    .isLength({ min: 30 }).withMessage('Invalid access token length')
    .matches(/^shp(at|ss)_[a-f0-9]+$/).withMessage('Invalid token format. Use Admin API token (shpat_xxx)'),
  handleValidationErrors
];

module.exports = {
  signupValidation,
  loginValidation,
  shopifyValidation,
  handleValidationErrors
};
