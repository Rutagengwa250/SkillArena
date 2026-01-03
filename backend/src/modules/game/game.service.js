// src/modules/game/game.service.js
import prisma from "../../prisma.js";
import { checkWinner } from "./game.utils.js";
import { distributePayout } from "../payout/payout.service.js";

export const makeMove = async (io, userId, matchId, position) => {
  console.log("MAKE MOVE SERVICE");
  console.log("Params:", { userId, matchId, position });
  
  if (position < 0 || position > 8) {
    throw new Error("Invalid position (0-8 only)");
  }
  
  try {
    // Get participant
    const participant = await prisma.matchParticipant.findFirst({
      where: {
        matchId: matchId,
        userId: userId
      }
    });
    
    if (!participant) {
      throw new Error("Not part of this match");
    }
    
    // Get game state
    const gameState = await prisma.gameState.findUnique({
      where: { matchId: matchId }
    });
    
    if (!gameState) {
      throw new Error("Game not started");
    }
    
    if (gameState.status !== "ongoing") {
      throw new Error(`Game is ${gameState.status}, cannot make move`);
    }
    
    if (gameState.turn !== participant.symbol) {
      throw new Error(`Not your turn. Current turn: ${gameState.turn}`);
    }
    
    // Update board
    let boardArr = gameState.board.split("");
    
    if (boardArr[position] !== "-") {
      throw new Error("Cell already occupied");
    }
    
    boardArr[position] = participant.symbol;
    const newBoard = boardArr.join("");
    
    // Check winner using imported function
    const winnerSymbol = checkWinner(boardArr);
    let status = gameState.status;
    let isGameFinished = false;
    let payoutResult = null;
    
    if (winnerSymbol === "X" || winnerSymbol === "O") {
      status = "finished";
      isGameFinished = true;
    } else if (winnerSymbol === "draw") {
      status = "draw";
      isGameFinished = true;
    }
    
    // Update game state
    const updatedGame = await prisma.gameState.update({
      where: { matchId: matchId },
      data: {
        board: newBoard,
        turn: participant.symbol === "X" ? "O" : "X",
        status: status
      }
    });
    
    // Record the move
    await prisma.gameMove.create({
      data: {
        matchId: matchId,
        userId: userId,
        position: position,
        symbol: participant.symbol
      }
    });
    
    // Emit socket event
    if (io) {
      io.to(`match_${matchId}`).emit("moveMade", {
        position: position,
        symbol: participant.symbol,
        board: newBoard,
        turn: updatedGame.turn,
        status: status
      });
    }
    
    // Handle game finished
    if (isGameFinished) {
      console.log(`Game ${matchId} finished. ${winnerSymbol === "draw" ? 'Draw' : 'Winner: ' + winnerSymbol}`);
      
      let winnerId = null;
      
      if (winnerSymbol === "draw") {
        // Create game result for draw
        await prisma.gameResult.create({
          data: {
            matchId: matchId,
            winnerId: null,
            result: "draw"
          }
        });
        
        // Distribute payout/refund for draw
        try {
          payoutResult = await distributePayout(matchId);
          console.log(`Draw for match ${matchId}, stakes refunded`);
        } catch (payoutError) {
          console.error(`Failed to distribute payout for match ${matchId}:`, payoutError);
          // Don't fail the move if payout fails
        }
        
      } else {
        // Get winner ID
        const winnerParticipant = await prisma.matchParticipant.findFirst({
          where: {
            matchId: matchId,
            symbol: winnerSymbol
          }
        });
        
        winnerId = winnerParticipant.userId;
        
        // Create game result for win
        await prisma.gameResult.create({
          data: {
            matchId: matchId,
            winnerId: winnerId,
            result: winnerSymbol
          }
        });
        
        // Distribute payout for win
        try {
          payoutResult = await distributePayout(matchId);
          console.log(`Payout distributed for match ${matchId}:`, payoutResult);
        } catch (payoutError) {
          console.error(`Failed to distribute payout for match ${matchId}:`, payoutError);
          // Don't fail the move if payout fails
        }
      }
      
      // Update match status to finished
      await prisma.match.update({
        where: { id: matchId },
        data: { 
          status: "finished"
        }
      });
      
      // Emit game over event
      if (io) {
        io.to(`match_${matchId}`).emit("gameOver", {
          winner: winnerSymbol,
          winnerId: winnerId,
          payout: payoutResult,
          board: newBoard
        });
      }
    }
    
    return {
      success: true,
      game: updatedGame,
      winner: winnerSymbol,
      payout: payoutResult,
      isGameFinished: isGameFinished
    };
    
  } catch (error) {
    console.error("Error in makeMove service:", error);
    throw error;
  }
};
