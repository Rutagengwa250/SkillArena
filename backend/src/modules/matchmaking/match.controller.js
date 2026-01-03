// src/modules/matchmaking/match.controller.js
import { createMatch, joinMatch, listWaitingMatches } from "./match.service.js";

// Create match controller
export const createMatchController = async (req, res) => {
  console.log("CREATE MATCH CONTROLLER CALLED");
  
  try {
    const { stake, matchType } = req.body;
    
    if (!stake || stake <= 0) {
      return res.status(400).json({ 
        error: "Valid stake amount required",
        details: "Stake must be a positive number" 
      });
    }
    
    // Debug log
    console.log("createMatch function exists:", typeof createMatch);
    
    const match = await createMatch(req.userId, stake, matchType || "tictactoe");
    
    res.status(201).json({ 
      success: true,
      match: {
        id: match.id,
        matchCode: match.matchCode,
        stake: match.stake,
        status: match.status,
        participants: match.participants || []
      }
    });
  } catch (err) {
    console.error("Error in createMatchController:", err);
    res.status(400).json({ 
      error: err.message,
      details: err.toString()
    });
  }
};

// Join match controller
export const joinMatchController = async (req, res) => {
  console.log("JOIN MATCH CONTROLLER CALLED");
  console.log("User ID:", req.userId);
  console.log("Match Code from body:", req.body.matchCode);
  
  try {
    const { matchCode } = req.body;
    
    if (!matchCode) {
      return res.status(400).json({ 
        success: false,
        error: "Match code is required" 
      });
    }
    
    // Debug log
    console.log("joinMatch function exists:", typeof joinMatch);
    console.log("All imported functions:", { createMatch: typeof createMatch, joinMatch: typeof joinMatch, listWaitingMatches: typeof listWaitingMatches });
    
    const match = await joinMatch(req.userId, matchCode);
    
    console.log("joinMatch returned match:", {
      id: match?.id,
      matchCode: match?.matchCode,
      status: match?.status
    });
    
    res.json({ 
      success: true,
      match: {
        id: match.id,
        matchCode: match.matchCode,
        stake: match.stake,
        status: match.status,
        participants: match.participants || []
      }
    });
  } catch (err) {
    console.error("Error in joinMatchController:", err);
    res.status(400).json({ 
      success: false,
      error: err.message,
      details: err.toString()
    });
  }
};

// List waiting matches
export const listMatchesController = async (req, res) => {
  console.log("LIST MATCHES CONTROLLER CALLED");
  
  try {
    const matches = await listWaitingMatches();
    
    res.json({ 
      success: true,
      matches: matches.map(match => ({
        id: match.id,
        matchCode: match.matchCode,
        stake: match.stake,
        status: match.status,
        participants: match.participants || []
      }))
    });
  } catch (err) {
    console.error("Error in listMatchesController:", err);
    res.status(500).json({ 
      error: err.message,
      details: err.toString()
    });
  }
};