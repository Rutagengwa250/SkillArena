// src/modules/payout/payout.service.js
import prisma from "../../prisma.js";

const PLATFORM_USER_ID = process.env.PLATFORM_USER_ID ? parseInt(process.env.PLATFORM_USER_ID) : 1;

/**
 * Get or create wallet for a user
 */
const getOrCreateWallet = async (tx, userId) => {
  let wallet = await tx.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    // Check if user exists
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    wallet = await tx.wallet.create({
      data: {
        userId,
        balance: 0
      }
    });
  }

  return wallet;
};

/**
 * Handle draw - refund stakes to both players
 */
const handleDraw = async (tx, match) => {
  console.log(`Handling draw refund for match ${match.id}...`);
  
  for (const participant of match.participants) {
    const userWallet = await getOrCreateWallet(tx, participant.userId);
    
    // Refund stake
    await tx.wallet.update({
      where: { id: userWallet.id },
      data: { balance: { increment: match.stake } },
    });

    // Record refund transaction
    await tx.walletTransaction.create({
      data: {
        walletId: userWallet.id,
        userId: participant.userId,
        amount: match.stake,
        type: "REFUND",
        reference: `match:${match.id}:draw`,
      },
    });

    console.log(`Refunded ${match.stake} to user ${participant.userId}`);
  }

  return { isDraw: true, refundedAmount: match.stake };
};

/**
 * Handle win - distribute payout to winner with platform fee
 */
const handleWin = async (tx, match, gameResult) => {
  console.log(`Handling win payout for match ${match.id}...`);
  console.log(`Winner: ${gameResult.winnerId}`);

  const totalStake = match.stake * match.participants.length;
  const platformCut = Math.floor(totalStake * 0.1); // 10% platform fee
  const winnerAmount = totalStake - platformCut;

  console.log(`Total stake: ${totalStake}, Platform cut: ${platformCut}, Winner amount: ${winnerAmount}`);

  // Get or create winner's wallet
  const winnerWallet = await getOrCreateWallet(tx, gameResult.winnerId);

  // Update winner wallet
  await tx.wallet.update({
    where: { id: winnerWallet.id },
    data: { balance: { increment: winnerAmount } },
  });

  console.log(`Updated winner ${gameResult.winnerId} wallet: +${winnerAmount}`);

  // Record winner transaction
  await tx.walletTransaction.create({
    data: {
      walletId: winnerWallet.id,
      userId: gameResult.winnerId,
      amount: winnerAmount,
      type: "WIN",
      reference: `match:${match.id}`,
    },
  });

  // Get or create platform wallet
  let platformWallet = await tx.wallet.findUnique({
    where: { userId: PLATFORM_USER_ID }
  });

  if (!platformWallet) {
    console.log("Creating platform wallet...");
    
    // Check if platform user exists
    const platformUser = await tx.user.findUnique({
      where: { id: PLATFORM_USER_ID }
    });

    if (!platformUser) {
      throw new Error(`Platform user ${PLATFORM_USER_ID} not found`);
    }

    platformWallet = await tx.wallet.create({
      data: {
        userId: PLATFORM_USER_ID,
        balance: 0
      }
    });
  }

  // Update platform wallet
  await tx.wallet.update({
    where: { id: platformWallet.id },
    data: { balance: { increment: platformCut } },
  });

  console.log(`Updated platform wallet: +${platformCut}`);

  // Record platform fee
  await tx.walletTransaction.create({
    data: {
      walletId: platformWallet.id,
      userId: PLATFORM_USER_ID,
      amount: platformCut,
      type: "PLATFORM_FEE",
      reference: `match:${match.id}`,
    },
  });

  return { 
    winnerId: gameResult.winnerId, 
    winnerAmount, 
    platformCut,
    totalStake,
    isDraw: false
  };
};

/**
 * Distribute match payout to winner and platform OR refund for draw
 */
export const distributePayout = async (matchId) => {
  console.log(`Distributing payout for match ${matchId}...`);
  
  return await prisma.$transaction(async (tx) => {
    // Get match with participants
    const match = await tx.match.findUnique({
      where: { id: matchId },
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
      },
    });

    if (!match) throw new Error("Match not found");
    if (match.paidOut) {
      console.log("Match already paid out");
      return { alreadyPaid: true };
    }

    // Get game result
    const gameResult = await tx.gameResult.findUnique({ 
      where: { matchId } 
    });
    
    if (!gameResult) {
      console.log("No game result found");
      throw new Error("Game result not found");
    }
    
    let payoutResult;
    
    // Check if it's a draw (no winner) or a win
    if (!gameResult.winnerId) {
      // It's a draw - refund both players
      console.log("Match ended in a draw - refunding stakes");
      payoutResult = await handleDraw(tx, match);
    } else {
      // There's a winner - distribute payout
      payoutResult = await handleWin(tx, match, gameResult);
    }

    // Mark match as paid out
    await tx.match.update({
      where: { id: matchId },
      data: { paidOut: true },
    });

    console.log(`Marked match ${matchId} as paid out`);

    return payoutResult;
  });
};

// Get match result with payout info
export const getMatchResult = async (matchId) => {
  try {
    const gameResult = await prisma.gameResult.findUnique({
      where: { matchId: parseInt(matchId) },
      include: {
        winner: {
          select: {
            id: true,
            username: true
          }
        },
        match: {
          select: {
            stake: true,
            participants: true,
            paidOut: true
          }
        }
      }
    });
    
    if (!gameResult) {
      return null;
    }
    
    let payout = null;
    let isDraw = !gameResult.winnerId;
    
    if (isDraw) {
      // For draw, each player gets their stake back
      payout = {
        isDraw: true,
        refundAmount: gameResult.match.stake,
        totalStake: gameResult.match.stake * gameResult.match.participants.length,
        paidOut: gameResult.match.paidOut
      };
    } else if (gameResult.winnerId) {
      // For win, calculate winner payout
      const totalStake = gameResult.match.stake * gameResult.match.participants.length;
      const platformCut = Math.floor(totalStake * 0.1);
      const winnerAmount = totalStake - platformCut;
      
      payout = {
        winnerAmount,
        platformCut,
        totalStake,
        isDraw: false,
        paidOut: gameResult.match.paidOut
      };
    }
    
    return {
      winner: gameResult.result,
      winnerId: gameResult.winnerId,
      winnerName: gameResult.winner?.username,
      payout,
      matchId: parseInt(matchId),
      isDraw
    };
  } catch (error) {
    console.error("Error in getMatchResult:", error);
    throw error;
  }
};