const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { signupValidation, loginValidation } = require('../../middleware/validate');

router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);

module.exports = router;
