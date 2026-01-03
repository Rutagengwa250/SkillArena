import express from 'express';
import { protect } from '../auth/auth.middleware.js';
import {
  getWalletBalance,
  getWalletTransactions,
  depositTokens,
  withdrawTokens
} from './wallet.controller.js';

const router = express.Router();

router.get('/balance', protect, getWalletBalance);
router.get('/transactions', protect, getWalletTransactions);
router.post('/deposit', protect, depositTokens);
router.post('/withdraw', protect, withdrawTokens);

export default router;