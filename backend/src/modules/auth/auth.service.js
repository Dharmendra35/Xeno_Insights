const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { jwtSecret } = require('../../config/env');
const { AppError } = require('../../utils/error');

const prisma = new PrismaClient();

const generateToken = (tenantId) => {
  return jwt.sign({ tenantId }, jwtSecret, { expiresIn: '7d' });
};

const signup = async (name, email, password) => {
  const existingTenant = await prisma.tenant.findUnique({ where: { email } });
  if (existingTenant) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const tenant = await prisma.tenant.create({
    data: { name, email, password: hashedPassword }
  });

  const token = generateToken(tenant.id);
  return {
    token,
    tenant: { id: tenant.id, name: tenant.name, email: tenant.email }
  };
};

const login = async (email, password) => {
  const tenant = await prisma.tenant.findUnique({ where: { email } });
  if (!tenant) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValidPassword = await bcrypt.compare(password, tenant.password);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(tenant.id);
  return {
    token,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      shopifyDomain: tenant.shopifyDomain
    }
  };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

module.exports = { signup, login, verifyToken, generateToken };
