import api from '../utils/api.js';

export const statsService = {
  getPlayerStats: async () => {
    try {
      const response = await api.get('/stats/player-stats');
      return response.data;
    } catch (error) {
      console.error('Error getting player stats:', error);
      
      // Fallback to localStorage data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          success: false,
          totalMatches: user.totalMatches || 0,
          wins: user.wins || 0,
          losses: user.losses || 0,
          draws: user.draws || 0,
          winRate: user.winRate || 0,
          totalEarned: user.totalEarned || 0,
          totalTokens: user.balance || 0,
          currentStreak: user.currentStreak || 0,
          bestStreak: user.bestStreak || 0,
          averageMatchTime: 4.2,
          offline: true
        };
      }
      
      throw error;
    }
  },

  getMatchHistory: async (limit = 10, offset = 0) => {
    try {
      const response = await api.get('/stats/match-history', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting match history:', error);
      
      // Return empty array if offline
      return {
        success: false,
        matches: [],
        total: 0,
        offline: true
      };
    }
  },

  getAchievements: async () => {
    try {
      const response = await api.get('/stats/achievements');
      return response.data;
    } catch (error) {
      console.error('Error getting achievements:', error);
      
      // Return basic achievements if offline
      return {
        success: false,
        achievements: [
          { id: 1, name: "First Win", description: "Win your first match", unlocked: false, icon: "🏆", progress: 0, required: 1 },
          { id: 2, name: "5 Win Streak", description: "Win 5 matches in a row", unlocked: false, icon: "🔥", progress: 0, required: 5 },
          { id: 3, name: "Token Collector", description: "Earn 1000 tokens", unlocked: false, icon: "💰", progress: 0, required: 1000 },
          { id: 4, name: "Veteran", description: "Play 50 matches", unlocked: false, icon: "🎮", progress: 0, required: 50 }
        ],
        offline: true
      };
    }
  }
};