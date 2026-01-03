import { verifyAdminToken } from './admin.auth.js';

export const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  const decoded = verifyAdminToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  req.adminId = decoded.adminId;
  req.adminRole = decoded.role;
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }
  next();
};