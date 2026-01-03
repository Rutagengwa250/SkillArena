import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { 
  getGameStateController,
  makeMoveController,
  startGameController 
} from "./game.controller.js";

const router = express.Router();

// Game state
router.get("/state/:matchId", protect, getGameStateController);

// Make a move
router.post("/move", protect, makeMoveController);

// Start game (when 2 players have joined)
router.post("/start/:matchId", protect, startGameController);

export default router;