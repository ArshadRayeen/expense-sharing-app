// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: number;
}

// Group types
export interface Group {
  id: string;
  name: string;
  members: string[];
  created_by: string;
  created_at: number;
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
  group_id: string;
  amount: number;
  description: string;
  payer_id: string;
  date: string | number; // Can be ISO string or timestamp
  split_type: 'EQUAL' | 'EXACT' | 'PERCENT';
}

export interface ExpenseSplit {
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
}

// Settlement types
export interface Settlement {
  id: string;
  payer_id: string;
  payee_id: string;
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

export interface Friend {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface AddFriendPayload {
  name: string;
  email: string;
} 