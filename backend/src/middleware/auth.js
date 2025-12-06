const { verifyToken } = require('../modules/auth/auth.service');
const { AppError } = require('../utils/error');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authMiddleware };
