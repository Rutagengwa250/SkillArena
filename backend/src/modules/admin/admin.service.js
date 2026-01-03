import prisma from '../../prisma.js';

// Dashboard Statistics
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalMatches,
    totalStaked,
    platformEarnings,
    activeMatches,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
    prisma.walletTransaction.aggregate({
      where: { type: 'STAKE' },
      _sum: { amount: true }
    }),
    prisma.walletTransaction.aggregate({
      where: { type: 'PLATFORM_FEE' },
      _sum: { amount: true }
    }),
    prisma.match.count({
      where: { status: { in: ['waiting', 'ongoing'] } }
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        wallet: {
          select: { balance: true }
        }
      }
    })
  ]);

  return {
    totalUsers,
    totalMatches,
    totalStaked: Math.abs(totalStaked._sum.amount || 0),
    platformEarnings: platformEarnings._sum.amount || 0,
    activeMatches,
    recentUsers: recentUsers.map(user => ({
      ...user,
      balance: user.wallet?.balance || 0
    }))
  };
};

// User Management
export const getAllUsers = async (page = 1, limit = 20, search = '') => {
  const skip = (page - 1) * limit;
  
  const where = search ? {
    OR: [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        wallet: {
          select: { balance: true }
        },
        _count: {
          select: {
            matches: true,
            wins: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.wallet?.balance || 0,
      totalMatches: user._count.matches,
      totalWins: user._count.wins,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      wallet: {
        include: {
          transactions: {
            take: 20,
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      matches: {
        include: {
          match: {
            include: {
              gameResult: true,
              participants: {
                include: {
                  user: {
                    select: { username: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { match: { createdAt: 'desc' } },
        take: 20
      },
      wins: {
        include: {
          match: true
        },
        take: 10
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    wallet: user.wallet,
    recentMatches: user.matches.map(p => ({
      matchId: p.match.id,
      matchCode: p.match.matchCode,
      stake: p.match.stake,
      status: p.match.status,
      result: p.match.gameResult ? 
        (p.match.gameResult.winnerId === user.id ? 'win' : 
         p.match.gameResult.winnerId ? 'loss' : 'draw') : 'pending',
      opponent: p.match.participants.find(p2 => p2.userId !== user.id)?.user?.username,
      createdAt: p.match.createdAt
    })),
    recentWins: user.wins.map(win => ({
      matchId: win.matchId,
      matchCode: win.match.matchCode,
      stake: win.match.stake,
      createdAt: win.createdAt
    }))
  };
};

export const updateUserStatus = async (userId, updates) => {
  const user = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updates
  });

  return user;
};

// Match Management
export const getAllMatches = async (page = 1, limit = 20, status = '') => {
  const skip = (page - 1) * limit;
  
  const where = status ? { status } : {};

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          include: {
            user: {
              select: { username: true }
            }
          }
        },
        gameResult: {
          include: {
            winner: {
              select: { username: true }
            }
          }
        }
      }
    }),
    prisma.match.count({ where })
  ]);

  return {
    matches: matches.map(match => ({
      id: match.id,
      matchCode: match.matchCode,
      stake: match.stake,
      status: match.status,
      paidOut: match.paidOut,
      participants: match.participants.map(p => ({
        username: p.user.username,
        symbol: p.symbol
      })),
      winner: match.gameResult?.winner?.username,
      result: match.gameResult?.result,
      createdAt: match.createdAt
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getMatchDetails = async (matchId) => {
  const match = await prisma.match.findUnique({
    where: { id: parseInt(matchId) },
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
      },
      gameState: true,
      gameResult: {
        include: {
          winner: {
            select: { username: true }
          }
        }
      },
      moves: {
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!match) {
    throw new Error('Match not found');
  }

  return {
    match: {
      id: match.id,
      matchCode: match.matchCode,
      stake: match.stake,
      status: match.status,
      paidOut: match.paidOut,
      matchType: match.matchType,
      createdAt: match.createdAt
    },
    participants: match.participants,
    gameState: match.gameState,
    gameResult: match.gameResult,
    moves: match.moves
  };
};

// Platform Wallet Management
export const getPlatformWallet = async () => {
  const PLATFORM_USER_ID = Number(process.env.PLATFORM_USER_ID) || 1;
  
  const wallet = await prisma.wallet.findUnique({
    where: { userId: PLATFORM_USER_ID },
    include: {
      transactions: {
        take: 50,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!wallet) {
    // Create platform wallet if it doesn't exist
    return await prisma.wallet.create({
      data: {
        userId: PLATFORM_USER_ID,
        balance: 0
      },
      include: {
        transactions: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  return wallet;
};

// System Logs
export const getSystemLogs = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { username: true }
        }
      }
    }),
    prisma.adminLog.count()
  ]);

  return {
    logs: logs.map(log => ({
      id: log.id,
      admin: log.admin.username,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};