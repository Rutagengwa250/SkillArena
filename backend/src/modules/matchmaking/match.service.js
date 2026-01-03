// src/modules/matchmaking/match.service.js
import prisma from "../../prisma.js";

export const createMatch = async (userId, stake, matchType) => {
  console.log("createMatch service called with:", { userId, stake, matchType });
  
  try {
    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < stake) {
      throw new Error("Insufficient tokens");
    }

    // Generate unique match code
    const matchCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    console.log("Creating match with code:", matchCode);

    // Create match
    const match = await prisma.match.create({
      data: {
        stake: Number(stake),
        status: "waiting",
        matchCode: matchCode,
        paidOut: false,
        creatorId: userId,
        matchType: matchType || "tictactoe", 
        participants: {
          create: {
            userId: userId,
            symbol: "X",
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Deduct stake from wallet
    await prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: stake } },
    });

    // Record transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: userId,
        amount: -stake,
        type: "STAKE",
        reference: `match:${match.id}`,
      },
    });

    console.log("Match created successfully:", match.id);
    return match;
  } catch (error) {
    console.error("Error in createMatch service:", error);
    throw error;
  }
};

export const listWaitingMatches = async () => {
  console.log("listWaitingMatches service called");
  
  try {
    const matches = await prisma.match.findMany({
      where: { 
        OR: [
          { status: "waiting" },
          { status: "ready" } // Include ready matches
        ]
      },
      include: { 
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        } 
      },
    });
    
    console.log(`Found ${matches.length} available matches`);
    return matches;
  } catch (error) {
    console.error("Error in listWaitingMatches:", error);
    throw error;
  }
};

export const joinMatch = async (userId, matchCode) => {
  const trimmedCode = matchCode.trim();
  
  console.log("=== JOIN MATCH SERVICE START ===");
  console.log("User ID:", userId, "trying to join match:", trimmedCode);
  
  try {
    // Find the match
    const match = await prisma.match.findUnique({
      where: { matchCode: trimmedCode },
      include: { 
        participants: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });

    if (!match) {
      throw new Error(`Match not found: ${trimmedCode}`);
    }
    
    console.log("Match status:", match.status);
    console.log("Participants:", match.participants.map(p => ({ userId: p.userId, symbol: p.symbol })));
    
    // Check if user is already a participant
    const isParticipant = match.participants.some(p => p.userId === userId);
    
    if (isParticipant) {
      console.log("User is already a participant in this match");
      
      // If user is already a participant, just return the match
      // This allows the creator to access the match details
      if (match.status === "ready" || match.status === "ongoing") {
        console.log("Match is ready/ongoing, allowing access");
        return match;
      }
      
      // If match is still waiting and user is already in it, that's fine
      // They might be checking the match status
      return match;
    }
    
    // If user is NOT a participant, continue with normal join logic
    if (match.status !== "waiting") {
      throw new Error("Match is not waiting for players");
    }
    
    if (match.participants.length >= 2) {
      throw new Error("Match is full");
    }

    // Check wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < match.stake) {
      throw new Error("Insufficient tokens");
    }

    // Add participant (second player gets "O")
    await prisma.matchParticipant.create({
      data: {
        matchId: match.id,
        userId,
        symbol: "O",
      },
    });

    // Update wallet
    await prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance - match.stake },
    });

    // Record transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        amount: -match.stake,
        type: "STAKE",
        reference: `match:${match.id}`,
      },
    });

    // Get updated match
    const updatedMatch = await prisma.match.findUnique({
      where: { id: match.id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });

    // Check if now 2 players
    const playerCount = updatedMatch.participants.length;
    console.log(`Match ${updatedMatch.matchCode} now has ${playerCount}/2 players`);
    
    // If 2 players, create game state and mark as "ready"
    if (playerCount === 2) {
      console.log("2 players joined, creating game state...");
      
      await prisma.gameState.create({
        data: {
          matchId: updatedMatch.id,
          board: "---------",
          turn: "X", // Creator (first player) goes first
          status: "ready",
        },
      });
      
      // Update match to indicate it's ready to start
      await prisma.match.update({
        where: { id: updatedMatch.id },
        data: { 
          status: "ready"
        },
      });
    }

    console.log("=== JOIN MATCH SERVICE END ===");
    
    return updatedMatch;
  } catch (error) {
    console.error("ERROR in joinMatch service:", error.message);
    throw error;
  }
};
export const createRematch = async (userId, originalMatchId) => {
  try {
    // Get original match
    const originalMatch = await prisma.match.findUnique({
      where: { id: originalMatchId },
      include: { participants: true }
    });
    
    if (!originalMatch) {
      throw new Error("Original match not found");
    }
    
    // Create new match with same stake
    const matchCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newMatch = await prisma.match.create({
      data: {
        stake: originalMatch.stake,
        status: "waiting",
        matchCode,
        paidOut: false,
        creatorId: userId,
        matchType: "tictactoe",
        participants: {
          create: {
            userId: userId,
            symbol: "X", // Creator gets X again
          },
        },
      },
    });
    
    return newMatch;
  } catch (error) {
    console.error("Error creating rematch:", error);
    throw error;
  }
};