import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma.js';

export const adminLogin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!admin) {
    throw new Error('Invalid credentials');
  }

  if (!admin.isActive) {
    throw new Error('Account is disabled');
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { updatedAt: new Date() }
  });

  // Log the login
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'LOGIN',
      details: { timestamp: new Date().toISOString() }
    }
  });

  const token = jwt.sign(
    { 
      adminId: admin.id, 
      email: admin.email,
      role: admin.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    }
  };
};

export const verifyAdminToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};