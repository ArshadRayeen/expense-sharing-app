// User types
export interface User {
  id: string;
  email: string;
  name: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
}

// Expense types
export enum SplitType {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
  PERCENT = 'PERCENT'
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  payerId: string;
  date: string;
  splitType?: SplitType;
}

export interface ExpenseSplit {
  expenseId: string;
  userId: string;
  amountOwed: number;
}

// Settlement types
export interface Settlement {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  date: string;
}

// Balance types
export interface Balance {
  userId: string;
  otherUserId: string;
  amount: number; // Positive means userId owes otherUserId
}

// Form types
export interface ExpenseFormData {
  amount: string;
  description: string;
  payerId: string;
  participants: string[];
  splitType: SplitType;
  exactAmounts?: Record<string, string>;
  percentages?: Record<string, string>;
  groupId?: string;
}

export interface SettlementFormData {
  payerId: string;
  payeeId: string;
  amount: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
} 