import prisma from '../../prisma.js';
import { getWalletBalanceService, getWalletTransactionsService, depositTokensService, withdrawTokensService } from './wallet.service.js';

export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await getWalletBalanceService(userId);
    
    res.json({
      success: true,
      balance: wallet.balance,
      walletId: wallet.id
    });
  } catch (err) {
    console.error('Error getting wallet balance:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;
    
    const transactions = await getWalletTransactionsService(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (err) {
    console.error('Error getting wallet transactions:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const depositTokens = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    const result = await depositTokensService(userId, parseInt(amount));
    
    res.json({
      success: true,
      message: `Successfully deposited ${amount} tokens`,
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (err) {
    console.error('Error depositing tokens:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const withdrawTokens = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }
    
    const result = await withdrawTokensService(userId, parseInt(amount));
    
    res.json({
      success: true,
      message: `Successfully withdrew ${amount} tokens`,
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (err) {
    console.error('Error withdrawing tokens:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};