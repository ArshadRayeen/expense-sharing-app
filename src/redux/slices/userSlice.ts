import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthFormData } from '../../types';
import { userOperations } from '../../services/db';
import { generateId } from '../../utils/helpers';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  'user/signUp',
  async (userData: AuthFormData, { rejectWithValue }) => {
    try {
      const id = generateId();
      if (!userData.name) {
        return rejectWithValue('Name is required');
      }
      await userOperations.createUser(id, userData.email, userData.name);
      return { id, email: userData.email, name: userData.name } as User;
    } catch (error) {
      return rejectWithValue('Failed to sign up. Email might already be in use.');
    }
  }
);

export const logIn = createAsyncThunk(
  'user/logIn',
  async (userData: AuthFormData, { rejectWithValue }) => {
    try {
      const user = await userOperations.getUserByEmail(userData.email) as User | undefined;
      if (!user) {
        return rejectWithValue('User not found');
      }
      // In a real app, you would verify the password here
      return user;
    } catch (error) {
      return rejectWithValue('Failed to log in');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logOut: (state) => {
      state.currentUser = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logOut, updateUser } = userSlice.actions;
export default userSlice.reducer; 