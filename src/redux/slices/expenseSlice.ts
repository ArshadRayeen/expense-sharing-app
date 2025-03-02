import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseSplit, Settlement, SplitType } from '../../types';
import { expenseOperations, settlementOperations } from '../../services/db';
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

// Async thunks
export const addExpense = createAsyncThunk(
  'expense/addExpense',
  async ({ 
    amount, 
    description, 
    payerId, 
    participants, 
    splitType, 
    exactAmounts, 
    percentages, 
    groupId 
  }: {
    amount: number;
    description: string;
    payerId: string;
    participants: string[];
    splitType: SplitType;
    exactAmounts?: Record<string, string>;
    percentages?: Record<string, string>;
    groupId?: string;
  }, { rejectWithValue }) => {
    try {
      const expenseId = generateId();
      const date = new Date().toISOString();
      
      const expense: Expense = {
        id: expenseId,
        groupId: groupId || '',
        amount,
        description,
        payerId,
        date,
        splitType,
      };
      
      // Calculate split amounts based on the split type
      const splitAmounts = calculateSplitAmounts(
        amount,
        participants,
        payerId,
        splitType,
        exactAmounts,
        percentages
      );
      
      // Create expense splits
      const splits: ExpenseSplit[] = [];
      for (const [userId, amountOwed] of Object.entries(splitAmounts)) {
        splits.push({
          expenseId,
          userId,
          amountOwed,
        });
      }
      
      // Save to database
      await expenseOperations.addExpense(expense, splits);
      
      return { expense, splits };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExpensesForUser = createAsyncThunk(
  'expense/fetchExpensesForUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const expenses = await expenseOperations.getExpensesForUser(userId);
      
      // Fetch splits for each expense
      const allSplits: ExpenseSplit[] = [];
      for (const expense of expenses) {
        const splits = await expenseOperations.getExpenseSplitsForExpense(expense.id);
        allSplits.push(...splits);
      }
      
      return { expenses, splits: allSplits };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addSettlement = createAsyncThunk(
  'expense/addSettlement',
  async ({ 
    payerId, 
    payeeId, 
    amount, 
    note 
  }: {
    payerId: string;
    payeeId: string;
    amount: number;
    note?: string;
  }, { rejectWithValue }) => {
    try {
      const settlementId = generateId();
      const date = new Date().toISOString();
      
      const settlement: Settlement = {
        id: settlementId,
        payerId,
        payeeId,
        amount,
        date,
        note: note || '',
      };
      
      await settlementOperations.addSettlement(settlement);
      
      return settlement;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSettlementsForUser = createAsyncThunk(
  'expense/fetchSettlementsForUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const settlements = await settlementOperations.getSettlementsForUser(userId);
      return settlements;
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
        state.expenses.push(action.payload.expense);
        state.expenseSplits.push(...action.payload.splits);
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
      });
  },
});

export const { clearExpenseState, setExpenses } = expenseSlice.actions;
export default expenseSlice.reducer; 