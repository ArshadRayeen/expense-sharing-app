import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Group } from '../../types';
import { db } from '../../services/db';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
}

export const createGroup = createAsyncThunk(
  'groups/create',
  async ({ name, members }: { name: string; members: string[] }) => {
    const group = await db.createGroup({ name, members });
    return group;
  }
);

export const fetchGroups = createAsyncThunk(
  'groups/fetch',
  async (userId: string) => {
    const groups = await db.getGroupsByUserId(userId);
    return groups;
  }
);

const initialState: GroupState = {
  groups: [],
  isLoading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create group';
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
      });
  },
});

export default groupSlice.reducer; 