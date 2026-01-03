import express from 'express';
import { protectAdmin, requireSuperAdmin } from './admin.middleware.js';
import {
  login,
  getDashboard,
  getUsers,
  getUser,
  updateUser,
  getMatches,
  getMatch,
  getPlatformWallet,
  getLogs,
  forcePayout
} from './admin.controller.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.use(protectAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.patch('/users/:userId', updateUser);
router.get('/matches', getMatches);
router.get('/matches/:matchId', getMatch);
router.get('/platform-wallet', getPlatformWallet);
router.get('/logs', getLogs);

// Super admin only routes
router.post('/payout/:matchId/force', requireSuperAdmin, forcePayout);

export default router;