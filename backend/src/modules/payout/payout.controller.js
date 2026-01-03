// src/modules/payout/payout.controller.js
import prisma from '../../prisma.js';
import { distributePayout, getMatchResult } from "./payout.service.js";

export const payoutMatch = async (req, res) => {
  try {
    const { matchId } = req.body;

    const result = await distributePayout(matchId);

    if (result.alreadyPaid) {
      return res.status(200).json({ 
        success: true,
        message: "Match already paid out" 
      });
    }

    let message;
    if (result.isDraw) {
      message = `Draw - ${result.refundedAmount} tokens refunded to each player`;
    } else {
      message = "Payout distributed successfully";
    }

    res.json({
      success: true,
      message,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

export const getMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const result = await getMatchResult(matchId);
    
    if (!result) {
      return res.status(404).json({ 
        success: false,
        error: "Game result not found" 
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("Error getting match result:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};