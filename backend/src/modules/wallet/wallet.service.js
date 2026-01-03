import prisma from '../../prisma.js';

export const getWalletBalanceService = async (userId) => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0
      }
    });
  }

  return wallet;
};

// src/modules/wallet/wallet.service.js
export const getWalletTransactionsService = async (userId, limit = 20, offset = 0) => {
  const wallet = await getWalletBalanceService(userId);
  
  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    include: {
      User: {  // Changed from 'user' to 'User'
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  return transactions.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type,
    reference: tx.reference,
    createdAt: tx.createdAt,
    description: getTransactionDescription(tx),
    userId: tx.userId
  }));
};

export const depositTokensService = async (userId, amount) => {
  const wallet = await getWalletBalanceService(userId);

  // Update wallet balance
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: amount } }
  });

  // Create transaction record
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId: userId,
      amount: amount,
      type: 'DEPOSIT',
      reference: `deposit:${Date.now()}`
    }
  });

  return {
    newBalance: updatedWallet.balance,
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      description: `Deposit: ${amount} tokens`
    }
  };
};

export const withdrawTokensService = async (userId, amount) => {
  const wallet = await getWalletBalanceService(userId);

  // Check if sufficient balance
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Update wallet balance
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount } }
  });

  // Create transaction record
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId: userId,
      amount: -amount,
      type: 'WITHDRAWAL',
      reference: `withdrawal:${Date.now()}`
    }
  });

  return {
    newBalance: updatedWallet.balance,
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      description: `Withdrawal: ${amount} tokens`
    }
  };
};
export const applyTransaction = async ({ userId, amount, type, reference }) => {
  const wallet = await getWalletBalanceService(userId);
  
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId: userId,
      amount: amount,
      type: type,
      reference: reference
    }
  });
  
  return transaction;
};
// In the same file, update getTransactionDescription
const getTransactionDescription = (transaction) => {
  const types = {
    'DEPOSIT': 'Token Deposit',
    'WITHDRAWAL': 'Token Withdrawal',
    'STAKE': 'Match Stake',
    'WIN': 'Match Win',
    'REFUND': 'Match Refund',
    'PLATFORM_FEE': 'Platform Fee'
  };

  let description = types[transaction.type] || transaction.type;
  
  if (transaction.reference?.startsWith('match:')) {
    description = `Match #${transaction.reference.split(':')[1]}`;
  }
  
  if (transaction.type === 'WIN') {
    description = `Won ${Math.abs(transaction.amount)} tokens`;
  } else if (transaction.type === 'STAKE') {
    description = `Staked ${Math.abs(transaction.amount)} tokens`;
  } else if (transaction.type === 'DEPOSIT') {
    description = `Deposited ${Math.abs(transaction.amount)} tokens`;
  } else if (transaction.type === 'WITHDRAWAL') {
    description = `Withdrew ${Math.abs(transaction.amount)} tokens`;
  } else if (transaction.type === 'PLATFORM_FEE') {
    description = `Platform fee: ${Math.abs(transaction.amount)} tokens`;
  }

  return description;
};