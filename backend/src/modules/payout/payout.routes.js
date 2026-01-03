// src/modules/payout/payout.routes.js
import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { distributePayout, getMatchResult } from "./payout.service.js"; // Import service functions

const router = express.Router();

// Distribute payout
router.post("/distribute", protect, async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({
        success: false,
        error: "Match ID is required"
      });
    }
    
    const result = await distributePayout(matchId);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        error: "No winner or match not finished"
      });
    }
    
    res.json({
      success: true,
      message: "Payout distributed successfully",
      ...result
    });
  } catch (err) {
    console.error("Payout distribution error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get match result
router.get("/match-result/:matchId", protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const result = await getMatchResult(matchId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Match result not found"
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("Get match result error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;