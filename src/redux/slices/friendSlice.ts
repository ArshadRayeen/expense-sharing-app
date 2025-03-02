import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Friend, User, ExpenseSplit, Expense, AddFriendPayload } from '../../types';
import { db, userOperations, expenseOperations } from '../../services/db';

interface FriendState {
  friends: Friend[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to calculate balance from expenses
const calculateBalanceFromExpenses = (
  userId: string,
  friendId: string,
  expenses: Expense[]
): number => {
  return expenses.reduce((balance, expense) => {
    if (expense.payer_id === userId) {
      // User paid for the expense
      return balance + expense.amount;
    }
    if (expense.payer_id === friendId) {
      // Friend paid for the expense
      return balance - expense.amount;
    }
    return balance;
  }, 0);
};

export const addFriend = createAsyncThunk(
  'friends/add',
  async (payload: AddFriendPayload, { getState, rejectWithValue }) => {
    try {
      // Check if current user is logged in
      const currentUser = (getState() as any).auth.user;
      if (!currentUser) {
        throw new Error('You must be logged in to add friends');
      }

      // Check if user exists
      const existingUser = await userOperations.getUserByEmail(payload.email);

      // Check if the user is trying to add themselves
      if (existingUser?.id === currentUser.id) {
        throw new Error("You can't add yourself as a friend");
      }

      // Check if they're already friends
      const existingFriends = (getState() as any).friends.friends as Friend[];
      const isAlreadyFriend = existingFriends.some(
        friend => friend.email.toLowerCase() === payload.email.toLowerCase()
      );
      if (isAlreadyFriend) {
        throw new Error('This user is already your friend');
      }

      let friend: Friend;
      if (existingUser) {
        // Check if friendship already exists in database
        const isFriend = await userOperations.checkFriendship(currentUser.id, existingUser.id);
        if (isFriend) {
          throw new Error('This user is already your friend');
        }

        // If user exists, use their data
        friend = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          balance: 0,
        };
      } else {
        // Create new user if they don't exist
        const newUser: User = {
          id: Date.now().toString(),
          name: payload.name,
          email: payload.email,
          password_hash: '', // They'll set this when they register
          created_at: Date.now(),
        };
        
        await userOperations.addUser(newUser);
        
        friend = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          balance: 0,
        };
      }

      // Add to friends table
      await userOperations.addFriendship(currentUser.id, friend.id);

      return friend;
    } catch (error) {
      console.log('Add Friend Error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add friend');
    }
  }
);

export const fetchFriends = createAsyncThunk(
  'friends/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const users = await db.getFriendsByUserId(userId);
      const friends: Friend[] = await Promise.all(
        users.map(async (user) => {
          const expenses = await expenseOperations.getExpensesByUserId(user.id);
          const balance = calculateBalanceFromExpenses(userId, user.id, expenses);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            balance,
          };
        })
      );
      return friends;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

const initialState: FriendState = {
  friends: [],
  isLoading: false,
  error: null,
};

const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addFriend.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFriend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friends.push(action.payload);
      })
      .addCase(addFriend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
      });
  },
});

export default friendSlice.reducer; 