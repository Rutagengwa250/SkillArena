// src/modules/game/game.controller.js
import prisma from "../../prisma.js";
import { makeMove as makeMoveService } from "./game.service.js";

// Get game state
export const getGameStateController = async (req, res) => {
  console.log("GET GAME STATE CONTROLLER");
  console.log("Match ID:", req.params.matchId);
  console.log("User ID:", req.userId);
  
  try {
    const matchId = parseInt(req.params.matchId);
    
    if (isNaN(matchId)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }
    
    // Check if user is part of this match
    const participant = await prisma.matchParticipant.findFirst({
      where: {
        matchId: matchId,
        userId: req.userId
      }
    });
    
    if (!participant) {
      return res.status(403).json({ error: "Not part of this match" });
    }
    
    // Get game state
    const gameState = await prisma.gameState.findUnique({
      where: { matchId: matchId },
      include: {
        match: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!gameState) {
      // If no game state exists, check match status
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { participants: true }
      });
      
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      if (match.status === "waiting") {
        return res.status(200).json({ 
          gameState: null,
          match: match,
          message: "Waiting for opponent to join"
        });
      }
      
      if (match.status === "ready") {
        return res.status(200).json({ 
          gameState: null,
          match: match,
          message: "Ready to start game"
        });
      }
      
      return res.status(404).json({ error: "Game not started yet" });
    }
    
    res.json({ 
      success: true,
      gameState: gameState,
      playerSymbol: participant.symbol
    });
    
  } catch (err) {
    console.error("Error in getGameStateController:", err);
    res.status(500).json({ error: err.message });
  }
};

// Make a move
export const makeMoveController = async (req, res) => {
  console.log("MAKE MOVE CONTROLLER");
  console.log("Body:", req.body);
  console.log("User ID:", req.userId);
  
  try {
    const { matchId, position } = req.body;
    
    if (matchId === undefined || position === undefined) {
      return res.status(400).json({ error: "Match ID and position required" });
    }
    
    const io = req.app.get("io");
    const result = await makeMoveService(io, req.userId, parseInt(matchId), parseInt(position));
    
    res.json(result);
  } catch (err) {
    console.error("Error in makeMoveController:", err);
    res.status(400).json({ error: err.message });
  }
};

// Start game
export const startGameController = async (req, res) => {
  console.log("START GAME CONTROLLER");
  console.log("Match ID:", req.params.matchId);
  console.log("User ID:", req.userId);
  
  try {
    const matchId = parseInt(req.params.matchId);
    
    if (isNaN(matchId)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }
    
    // Check if user is part of this match
    const participant = await prisma.matchParticipant.findFirst({
      where: {
        matchId: matchId,
        userId: req.userId
      }
    });
    
    if (!participant) {
      return res.status(403).json({ error: "Not part of this match" });
    }
    
    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { participants: true }
    });
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    
    if (match.status !== "ready") {
      return res.status(400).json({ 
        error: `Game cannot be started. Current status: ${match.status}` 
      });
    }
    
    if (match.participants.length !== 2) {
      return res.status(400).json({ error: "Need 2 players to start" });
    }
    
    // Update match status to ongoing
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "ongoing" }
    });
    
    // Check if game state exists, create if not
    let gameState = await prisma.gameState.findUnique({
      where: { matchId: matchId }
    });
    
    if (!gameState) {
      gameState = await prisma.gameState.create({
        data: {
          matchId: matchId,
          board: "---------",
          turn: "X", // Creator (first player) goes first
          status: "ongoing"
        }
      });
    } else {
      // Update existing game state
      gameState = await prisma.gameState.update({
        where: { matchId: matchId },
        data: { status: "ongoing" }
      });
    }
    
    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`match_${matchId}`).emit("gameStarted", { 
        matchId,
        gameState 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Game started",
      gameState 
    });
    
  } catch (err) {
    console.error("Error in startGameController:", err);
    res.status(500).json({ error: err.message });
  }
};