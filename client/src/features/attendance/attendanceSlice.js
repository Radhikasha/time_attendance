import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api/attendance';

// Async thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token,
        },
      };
      const response = await axios.post(`${API_URL}/checkin`, {}, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (attendanceId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token,
        },
      };
      const response = await axios.put(`${API_URL}/checkout/${attendanceId}`, {}, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

export const getMyAttendance = createAsyncThunk(
  'attendance/getMyAttendance',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token,
        },
      };
      const response = await axios.get(`${API_URL}/me`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    attendance: [],
    loading: false,
    error: null,
    todayAttendance: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setTodayAttendance: (state, action) => {
      state.todayAttendance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        state.attendance.unshift(action.payload);
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        // Update the attendance record in the array
        const index = state.attendance.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Attendance
      .addCase(getMyAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
        // Check if there's an attendance record for today
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = action.payload.find(
          (record) => new Date(record.date).toISOString().split('T')[0] === today
        );
        if (todayRecord) {
          state.todayAttendance = todayRecord;
        }
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, setTodayAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
