import * as adminService from './admin.service.js';
import { adminLogin } from './admin.auth.js';
import prisma from '../../prisma.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await adminLogin(email, password);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    console.error('Error getting dashboard:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const result = await adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      search
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await adminService.getUserDetails(userId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: req.adminId,
        action: 'UPDATE_USER',
        details: { userId, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    const user = await adminService.updateUserStatus(userId, updates);
    
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getMatches = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    
    const result = await adminService.getAllMatches(
      parseInt(page),
      parseInt(limit),
      status
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error getting matches:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const result = await adminService.getMatchDetails(matchId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error getting match:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getPlatformWallet = async (req, res) => {
  try {
    const wallet = await adminService.getPlatformWallet();
    
    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        totalTransactions: wallet.transactions.length
      },
      recentTransactions: wallet.transactions.slice(0, 20)
    });
  } catch (err) {
    console.error('Error getting platform wallet:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const result = await adminService.getSystemLogs(
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error getting logs:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const forcePayout = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // You'll need to import your payout service
    const payoutService = await import('../payout/payout.service.js');
    const result = await payoutService.distributePayout(parseInt(matchId));
    
    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Cannot payout this match'
      });
    }
    
    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: req.adminId,
        action: 'FORCE_PAYOUT',
        details: { matchId, result },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      message: 'Payout forced successfully',
      ...result
    });
  } catch (err) {
    console.error('Error forcing payout:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};