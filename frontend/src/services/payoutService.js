// src/services/payoutService.js - NEW FILE
import api from '../utils/api.js';

export const payoutService = {
  // Get match result with payout info
  getMatchResult: async (matchId) => {
    try {
      const response = await api.get(`/payout/match-result/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting match result:', error);
      throw error;
    }
  },

  // Trigger payout distribution
  distributePayout: async (matchId) => {
    try {
      const response = await api.post('/payout/distribute', { matchId });
      return response.data;
    } catch (error) {
      console.error('Error distributing payout:', error);
      throw error;
    }
  },

  // Check and process payout automatically
  processMatchCompletion: async (matchId) => {
    try {
      // First get the match result
      const result = await payoutService.getMatchResult(matchId);
      
      // If there's a winner and payout hasn't been distributed, distribute it
      if (result.success && result.winner && result.winner !== 'draw') {
        if (!result.payout || !result.payout.paidOut) {
          const payoutResult = await payoutService.distributePayout(matchId);
          
          // Update user balance in localStorage
          if (payoutResult.success) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              const winnerId = result.winnerId;
              
              // If current user is the winner, update their balance
              if (user.id === winnerId) {
                user.balance = (user.balance || 0) + payoutResult.winnerAmount;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Return updated info
                return {
                  ...payoutResult,
                  updatedBalance: user.balance
                };
              }
            }
          }
          
          return payoutResult;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error processing match completion:', error);
      throw error;
    }
  }
};