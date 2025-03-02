import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Group } from '../../types';
import { groupOperations } from '../../services/db';
import { generateId } from '../../utils/helpers';

interface GroupState {
  groups: Group[];
  groupMembers: Record<string, string[]>; // groupId -> userId[]
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  groupMembers: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const createGroup = createAsyncThunk(
  'group/createGroup',
  async ({ name, createdBy, memberIds }: { name: string; createdBy: string; memberIds: string[] }, { rejectWithValue }) => {
    try {
      const groupId = generateId();
      const group = { id: groupId, name, createdBy };
      
      await groupOperations.createGroup(group);
      
      // Add members to the group
      for (const memberId of memberIds) {
        if (memberId !== createdBy) { // Creator is already added in createGroup
          await groupOperations.addUserToGroup(groupId, memberId);
        }
      }
      
      return { group, memberIds: [createdBy, ...memberIds] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupsForUser = createAsyncThunk(
  'group/fetchGroupsForUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const groups = await groupOperations.getGroupsForUser(userId);
      
      // Fetch members for each group
      const groupMembers: Record<string, string[]> = {};
      for (const group of groups) {
        const members = await groupOperations.getGroupMembers(group.id);
        groupMembers[group.id] = members.map(member => member.id);
      }
      
      return { groups, groupMembers };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMemberToGroup = createAsyncThunk(
  'group/addMemberToGroup',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      await groupOperations.addUserToGroup(groupId, userId);
      return { groupId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    clearGroupState: (state) => {
      state.groups = [];
      state.groupMembers = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.push(action.payload.group);
        state.groupMembers[action.payload.group.id] = action.payload.memberIds;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch groups
      .addCase(fetchGroupsForUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupsForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups;
        state.groupMembers = action.payload.groupMembers;
      })
      .addCase(fetchGroupsForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add member to group
      .addCase(addMemberToGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        const { groupId, userId } = action.payload;
        if (!state.groupMembers[groupId]) {
          state.groupMembers[groupId] = [];
        }
        if (!state.groupMembers[groupId].includes(userId)) {
          state.groupMembers[groupId].push(userId);
        }
      })
      .addCase(addMemberToGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGroupState } = groupSlice.actions;
export default groupSlice.reducer; 