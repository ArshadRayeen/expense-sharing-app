import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../services/db';

export const loadUserData = createAsyncThunk(
  'userData/load',
  async (userId: string, { dispatch }) => {
    try {
      // Load all user-related data in parallel
      const [friends, groups, expenses] = await Promise.all([
        db.getFriendsByUserId(userId),
        db.getGroupsByUserId(userId),
        db.getExpensesByUserId(userId)
      ]);

      // Update each slice with the loaded data
      dispatch({ type: 'friends/setFriends', payload: friends });
      dispatch({ type: 'groups/setGroups', payload: groups });
      dispatch({ type: 'expenses/setExpenses', payload: expenses });

      return true;
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }
); 