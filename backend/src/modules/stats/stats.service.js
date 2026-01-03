import prisma from '../../prisma.js';

export const getPlayerStatsService = async (userId) => {
  // Get all matches where user participated
  const participatedMatches = await prisma.matchParticipant.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          gameResult: true,
          participants: true
        }
      }
    }
  });

  // Calculate stats
  let totalMatches = participatedMatches.length;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalEarned = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Sort matches by creation date
  const sortedMatches = [...participatedMatches].sort((a, b) => 
    new Date(b.match.createdAt) - new Date(a.match.createdAt)
  );

  for (const participant of sortedMatches) {
    const match = participant.match;
    const gameResult = match.gameResult;
    
    if (gameResult) {
      if (gameResult.winnerId === userId) {
        wins++;
        tempStreak = tempStreak > 0 ? tempStreak + 1 : 1;
        totalEarned += match.stake * 2; // Winner gets stake * 2
      } else if (gameResult.winnerId === null) {
        draws++;
        tempStreak = 0;
        totalEarned += match.stake; // Draw returns stake
      } else {
        losses++;
        tempStreak = 0;
      }

      if (currentStreak === 0) {
        currentStreak = tempStreak;
      }
      
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }
  }

  // Get wallet balance for total tokens
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  return {
    totalMatches,
    wins,
    losses,
    draws,
    winRate: parseFloat(winRate.toFixed(1)),
    totalEarned,
    currentStreak,
    bestStreak,
    totalTokens: wallet?.balance || 0,
    averageMatchTime: 4.2 // This would require actual timing data
  };
};

export const getMatchHistoryService = async (userId, limit = 10, offset = 0) => {
  const matches = await prisma.matchParticipant.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          gameResult: {
            include: {
              winner: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
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
    },
    orderBy: {
      match: {
        createdAt: 'desc'
      }
    },
    take: limit,
    skip: offset
  });

  const formattedMatches = matches.map((participant) => {
    const match = participant.match;
    const opponent = match.participants.find(p => p.userId !== userId);
    const result = match.gameResult;

    return {
      id: match.id,
      matchCode: match.matchCode,
      stake: match.stake,
      status: match.status,
      createdAt: match.createdAt,
      opponent: opponent?.user?.username || 'Unknown',
      result: result ? (result.winnerId === userId ? 'win' : result.winnerId === null ? 'draw' : 'loss') : 'pending',
      winner: result?.winner?.username,
      earnings: result?.winnerId === userId ? match.stake * 2 : result?.winnerId === null ? match.stake : 0
    };
  });

  const total = await prisma.matchParticipant.count({
    where: { userId }
  });

  return {
    matches: formattedMatches,
    total
  };
};

export const getAchievementsService = async (userId) => {
  const stats = await getPlayerStatsService(userId);
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  const achievements = [
    { 
      id: 1, 
      name: "First Win", 
      description: "Win your first match",
      unlocked: stats.wins > 0,
      icon: "🏆",
      progress: stats.wins > 0 ? 100 : 0,
      required: 1
    },
    { 
      id: 2, 
      name: "5 Win Streak", 
      description: "Win 5 matches in a row",
      unlocked: stats.bestStreak >= 5,
      icon: "🔥",
      progress: Math.min(100, (stats.bestStreak / 5) * 100),
      required: 5
    },
    { 
      id: 3, 
      name: "Token Collector", 
      description: "Earn 1000 tokens",
      unlocked: stats.totalEarned >= 1000,
      icon: "💰",
      progress: Math.min(100, (stats.totalEarned / 1000) * 100),
      required: 1000
    },
    { 
      id: 4, 
      name: "Veteran", 
      description: "Play 50 matches",
      unlocked: stats.totalMatches >= 50,
      icon: "🎮",
      progress: Math.min(100, (stats.totalMatches / 50) * 100),
      required: 50
    },
    { 
      id: 5, 
      name: "Undefeated", 
      description: "Win 10 matches without losing",
      unlocked: stats.currentStreak >= 10,
      icon: "👑",
      progress: Math.min(100, (stats.currentStreak / 10) * 100),
      required: 10
    },
    { 
      id: 6, 
      name: "Rich Player", 
      description: "Have 5000 tokens in wallet",
      unlocked: (wallet?.balance || 0) >= 5000,
      icon: "💎",
      progress: Math.min(100, ((wallet?.balance || 0) / 5000) * 100),
      required: 5000
    },
  ];

  return achievements;
};