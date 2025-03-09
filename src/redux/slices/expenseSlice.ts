import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseSplit, Settlement, SplitType } from '../../types';
import { expenseOperations, settlementOperations, db } from '../../services/db';
import { generateId, calculateSplitAmounts } from '../../utils/helpers';

interface ExpenseState {
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
  settlements: Settlement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  expenseSplits: [],
  settlements: [],
  isLoading: false,
  error: null,
};

interface ExpenseSplit {
  user_id: string;
  amount: number;
}

interface AddExpensePayload {
  amount: number;
  description: string;
  payer_id: string;
  split_type: 'EQUAL' | 'EXACT' | 'PERCENT';
  participants: ExpenseSplit[];
  group_id: string;
}

// Async thunks
export const addExpense = createAsyncThunk(
  'expenses/add',
  async (payload: AddExpensePayload, { rejectWithValue }) => {
    try {
      const expense: Omit<Expense, 'id'> = {
        ...payload,
        date: Date.now(), // Use timestamp for consistency
      };
      const newExpense = await expenseOperations.createExpense(expense);
      return newExpense;
    } catch (error) {
      console.log('addExpense error',error);
      console.log('addExpense payload',payload);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add expense');
    }
  }
);

export const fetchExpensesForUser = createAsyncThunk(
  'expense/fetchExpensesForUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const expenses = await expenseOperations.getExpensesByUserId(userId);
      return { expenses, splits: [] }; // We'll implement splits later
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

export const addSettlement = createAsyncThunk(
  'expense/addSettlement',
  async ({ 
    payer_id,
    payee_id,
    amount,
    note 
  }: {
    payer_id: string;
    payee_id: string;
    amount: number;
    note?: string;
  }, { rejectWithValue }) => {
    try {
      const settlement: Settlement = {
        id: Date.now().toString(),
        payer_id,
        payee_id,
        amount,
        date: new Date().toISOString(),
      };
      
      // We need to implement this in the database service
      await db.createSettlement(settlement);
      
      return settlement;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

export const fetchSettlementsForUser = createAsyncThunk(
  'expense/fetchSettlementsForUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const settlements = await settlementOperations.getSettlementsByUserId(userId);
      return settlements;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense = await db.createExpense({
      ...expense,
      date: new Date().toISOString(),
    });
    return newExpense;
  }
);

export const fetchExpenses = createAsyncThunk(
  'expenses/fetch',
  async (userId: string) => {
    const expenses = await db.getExpensesByUserId(userId);
    return expenses;
  }
);

// Slice
const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearExpenseState: (state) => {
      state.expenses = [];
      state.expenseSplits = [];
      state.settlements = [];
      state.error = null;
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add expense
      .addCase(addExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch expenses
      .addCase(fetchExpensesForUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpensesForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.expenseSplits = action.payload.splits;
      })
      .addCase(fetchExpensesForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add settlement
      .addCase(addSettlement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSettlement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settlements.push(action.payload);
      })
      .addCase(addSettlement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch settlements
      .addCase(fetchSettlementsForUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettlementsForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settlements = action.payload;
      })
      .addCase(fetchSettlementsForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create expense';
      })
      
      // Fetch expenses
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
      });
  },
});

export const { clearExpenseState, setExpenses } = expenseSlice.actions;
export default expenseSlice.reducer; 