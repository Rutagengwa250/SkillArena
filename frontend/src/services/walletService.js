import api from '../utils/api.js';

export const walletService = {
  getBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      
      // Return fallback data if offline
      if (!navigator.onLine) {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        return {
          success: false,
          balance: user?.balance || 0,
          offline: true
        };
      }
      
      throw error;
    }
  },

  getTransactions: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get('/wallet/transactions', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      
      // Return empty array if offline
      if (!navigator.onLine) {
        return {
          success: false,
          transactions: [],
          total: 0,
          offline: true
        };
      }
      
      throw error;
    }
  },

  deposit: async (amount) => {
    try {
      const response = await api.post('/wallet/deposit', { amount });
      return response.data;
    } catch (error) {
      console.error('Error depositing tokens:', error);
      throw error;
    }
  },

  withdraw: async (amount) => {
    try {
      const response = await api.post('/wallet/withdraw', { amount });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
      throw error;
    }
  },

  // Get user data with balance
  getUserWithBalance: async () => {
    try {
      const balanceResponse = await api.get('/wallet/balance');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      return {
        ...user,
        balance: balanceResponse.data.balance
      };
    } catch (error) {
      console.error('Error getting user with balance:', error);
      
      // Fallback to localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          ...user,
          balance: user.balance || 0
        };
      }
      
      throw error;
    }
  }
};