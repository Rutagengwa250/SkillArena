import express from 'express';
import { protect } from '../auth/auth.middleware.js';
import {
  getPlayerStats,
  getMatchHistory,
  getAchievements
} from './stats.controller.js';

const router = express.Router();

router.get('/player-stats', protect, getPlayerStats);
router.get('/match-history', protect, getMatchHistory);
router.get('/achievements', protect, getAchievements);

export default router;