import { v4 as uuidv4 } from 'uuid';
import { Balance, ExpenseSplit, Settlement, Expense, SplitType } from '../types';

// Generate a unique ID
export const generateId = (): string => {
  return uuidv4();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

// Calculate balances between users based on expense splits and settlements
export const calculateBalances = (
  expenseSplits: ExpenseSplit[],
  settlements: Settlement[],
  expenses: Expense[]
): Balance[] => {
  const balanceMap: Record<string, Record<string, number>> = {};

  // Process expense splits
  for (const split of expenseSplits) {
    const { userId, expenseId, amountOwed } = split;
    const expense = expenses.find(e => e.id === expenseId);
    
    if (!expense) continue;
    
    const payerId = expense.payerId;
    
    if (userId === payerId) continue; // Skip if user is the payer
    
    // Initialize balance map entries if they don't exist
    if (!balanceMap[userId]) balanceMap[userId] = {};
    if (!balanceMap[payerId]) balanceMap[payerId] = {};
    
    // Update balance: userId owes payerId
    balanceMap[userId][payerId] = (balanceMap[userId][payerId] || 0) + amountOwed;
    // Update inverse balance: payerId is owed by userId
    balanceMap[payerId][userId] = (balanceMap[payerId][userId] || 0) - amountOwed;
  }

  // Process settlements
  for (const settlement of settlements) {
    const { payerId, payeeId, amount } = settlement;
    
    // Initialize balance map entries if they don't exist
    if (!balanceMap[payerId]) balanceMap[payerId] = {};
    if (!balanceMap[payeeId]) balanceMap[payeeId] = {};
    
    // Update balance: payerId paid payeeId
    balanceMap[payerId][payeeId] = (balanceMap[payerId][payeeId] || 0) - amount;
    // Update inverse balance: payeeId received from payerId
    balanceMap[payeeId][payerId] = (balanceMap[payeeId][payerId] || 0) + amount;
  }

  // Convert balance map to array of Balance objects
  const balances: Balance[] = [];
  
  for (const [userId, userBalances] of Object.entries(balanceMap)) {
    for (const [otherUserId, amount] of Object.entries(userBalances)) {
      if (amount > 0) {
        balances.push({
          userId,
          otherUserId,
          amount,
        });
      }
    }
  }

  return balances;
};

// Simplify debts to minimize the number of transactions
export const simplifyDebts = (balances: Balance[]): Balance[] => {
  if (balances.length <= 1) {
    return balances;
  }
  
  // Create a map of net balances for each user
  const netBalances: Record<string, number> = {};
  
  for (const balance of balances) {
    if (!netBalances[balance.userId]) {
      netBalances[balance.userId] = 0;
    }
    if (!netBalances[balance.otherUserId]) {
      netBalances[balance.otherUserId] = 0;
    }
    
    // If A owes B, then A's balance decreases and B's increases
    netBalances[balance.userId] -= balance.amount;
    netBalances[balance.otherUserId] += balance.amount;
  }
  
  // Create arrays of debtors (negative balance) and creditors (positive balance)
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];
  
  for (const [userId, amount] of Object.entries(netBalances)) {
    if (amount < 0) {
      debtors.push({ id: userId, amount: -amount });
    } else if (amount > 0) {
      creditors.push({ id: userId, amount });
    }
  }
  
  // Sort by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Create simplified balances
  const simplifiedBalances: Balance[] = [];
  
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    // Find the minimum of what the debtor owes and what the creditor is owed
    const amount = Math.min(debtor.amount, creditor.amount);
    
    // Create a new balance
    simplifiedBalances.push({
      userId: debtor.id,
      otherUserId: creditor.id,
      amount,
    });
    
    // Update amounts
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    // Remove users with zero balance
    if (debtor.amount < 0.01) {
      debtors.shift();
    }
    if (creditor.amount < 0.01) {
      creditors.shift();
    }
  }
  
  return simplifiedBalances;
};

// Calculate split amounts based on split type
export const calculateSplitAmounts = (
  amount: number,
  participants: string[],
  payerId: string,
  splitType: SplitType,
  exactAmounts?: Record<string, string>,
  percentages?: Record<string, string>
): Record<string, number> => {
  const splitAmounts: Record<string, number> = {};
  
  switch (splitType) {
    case SplitType.EQUAL:
      const equalShare = amount / participants.length;
      for (const userId of participants) {
        if (userId !== payerId) {
          splitAmounts[userId] = equalShare;
        }
      }
      break;
      
    case SplitType.EXACT:
      if (exactAmounts) {
        for (const [userId, amountStr] of Object.entries(exactAmounts)) {
          if (userId !== payerId) {
            splitAmounts[userId] = parseFloat(amountStr);
          }
        }
      }
      break;
      
    case SplitType.PERCENT:
      if (percentages) {
        for (const [userId, percentStr] of Object.entries(percentages)) {
          if (userId !== payerId) {
            const percent = parseFloat(percentStr) / 100;
            splitAmounts[userId] = amount * percent;
          }
        }
      }
      break;
  }
  
  return splitAmounts;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
}; 