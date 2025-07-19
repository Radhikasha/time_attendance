import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveAPI } from '../../services/leaveAPI';

export const createLeaveRequest = createAsyncThunk(
  'leave/createRequest',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await leaveAPI.createLeaveRequest(leaveData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create leave request');
    }
  }
);

export const getMyLeaveRequests = createAsyncThunk(
  'leave/getMyRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaveAPI.getMyLeaveRequests();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    myLeaveRequests: [],
    loading: false,
    error: null,
    requestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Leave Request
    builder.addCase(createLeaveRequest.pending, (state) => {
      state.requestStatus = 'loading';
      state.error = null;
    });
    builder.addCase(createLeaveRequest.fulfilled, (state, action) => {
      state.requestStatus = 'succeeded';
      state.myLeaveRequests = [action.payload, ...state.myLeaveRequests];
    });
    builder.addCase(createLeaveRequest.rejected, (state, action) => {
      state.requestStatus = 'failed';
      state.error = action.payload;
    });

    // Get My Leave Requests
    builder.addCase(getMyLeaveRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyLeaveRequests.fulfilled, (state, action) => {
      state.loading = false;
      state.myLeaveRequests = action.payload;
    });
    builder.addCase(getMyLeaveRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
