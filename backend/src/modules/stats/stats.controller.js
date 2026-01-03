import { getPlayerStatsService, getMatchHistoryService, getAchievementsService } from './stats.service.js';

export const getPlayerStats = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await getPlayerStatsService(userId);
    
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    console.error('Error getting player stats:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getMatchHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, offset = 0 } = req.query;
    
    const history = await getMatchHistoryService(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      matches: history.matches,
      total: history.total
    });
  } catch (err) {
    console.error('Error getting match history:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const userId = req.userId;
    const achievements = await getAchievementsService(userId);
    
    res.json({
      success: true,
      achievements
    });
  } catch (err) {
    console.error('Error getting achievements:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};