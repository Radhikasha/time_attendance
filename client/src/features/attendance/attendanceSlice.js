import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceRequestAPI, attendanceAPI } from '../../services/api';

// Async thunks for attendance requests
export const getAllAttendanceRequests = createAsyncThunk(
  'attendance/getAllRequests',
  async (status = 'pending', { rejectWithValue }) => {
    try {
      console.log('Fetching all attendance requests with status:', status);
      const response = await attendanceRequestAPI.getAdminRequests(status);
      console.log('Received response for all attendance requests:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance requests:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance requests'
      );
    }
  }
);

export const createAttendanceRequest = createAsyncThunk(
  'attendance/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      console.log('Creating attendance request with data:', requestData);
      const response = await attendanceRequestAPI.createRequest(requestData);
      console.log('Successfully created attendance request:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance request:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create attendance request'
      );
    }
  }
);

// Get my attendance requests
export const getMyAttendanceRequests = createAsyncThunk(
  'attendance/getMyRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceRequestAPI.getMyRequests(params);
      // Ensure we return an array even if the response is undefined or null
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching my attendance requests:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance requests'
      );
    }
  }
);

export const updateAttendanceRequestStatus = createAsyncThunk(
  'attendance/updateRequestStatus',
  async ({ requestId, status, adminComment }, { rejectWithValue }) => {
    try {
      const response = await attendanceRequestAPI.updateAdminRequestStatus(
        requestId,
        status,
        adminComment
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update request status'
      );
    }
  }
);

// Get today's attendance
export const getTodaysAttendance = createAsyncThunk(
  'attendance/getTodaysAttendance',
  async (_, { rejectWithValue, getState }) => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      console.log('Fetching attendance for date:', dateStr);
      
      // First try to get from the API
      const response = await attendanceAPI.getMyAttendance({ date: dateStr });
      console.log('API response for today\'s attendance:', response.data);
      
      // If no data from API, check if we have it in the state
      if (!response.data || !response.data._id) {
        console.log('No attendance data from API, checking state...');
        const state = getState().attendance;
        
        // Check if we have today's record in myAttendance
        if (state.myAttendance?.length > 0) {
          const todayRecord = state.myAttendance.find(record => 
            record.date && record.date.startsWith(dateStr)
          );
          
          if (todayRecord) {
            console.log('Found today\'s record in myAttendance:', todayRecord);
            return todayRecord;
          }
        }
        
        // If still not found, return empty object instead of null/undefined
        console.log('No attendance record found for today');
        return {};
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getTodaysAttendance:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s attendance');
    }
  }
);

// Get all attendance (admin)
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getAllAttendance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all attendance records'
      );
    }
  }
);

// Async thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.checkIn({});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (attendanceData, { rejectWithValue, getState, dispatch }) => {
    try {
      let attendanceId = attendanceData?._id || attendanceData;
      let attendanceRecord = attendanceData?._id ? attendanceData : null;
      
      console.log('Starting checkOut thunk with:', { attendanceId, attendanceRecord });
      
      // If no ID provided, try to find today's attendance
      if (!attendanceId) {
        console.log('No attendance ID provided, trying to find today\'s attendance');
        
        // First, check if we have today's attendance in the state
        const state = getState().attendance;
        const today = new Date().toISOString().split('T')[0];
        
        // Check if we have a check-in in todayAttendance
        if (state.todayAttendance?.checkIn && !state.todayAttendance.checkOut) {
          console.log('Found check-in in todayAttendance:', state.todayAttendance);
          attendanceId = state.todayAttendance._id;
          attendanceRecord = state.todayAttendance;
        }
        // If not, try to find in myAttendance
        else if (state.myAttendance?.length > 0) {
          console.log('Looking for today\'s attendance in myAttendance');
          const todayRecord = state.myAttendance.find(record => 
            record.date && record.date.startsWith(today) && record.checkIn && !record.checkOut
          );
          
          if (todayRecord?._id) {
            console.log('Found today\'s record in myAttendance:', todayRecord);
            attendanceId = todayRecord._id;
            attendanceRecord = todayRecord;
          }
        }
        
        // If we still don't have an ID, try to fetch from the API
        if (!attendanceId) {
          console.log('No local record found, fetching from API...');
          try {
            const todayResponse = await dispatch(getTodaysAttendance()).unwrap();
            if (todayResponse?._id) {
              attendanceId = todayResponse._id;
              attendanceRecord = todayResponse;
              console.log('Found today\'s attendance from API:', todayResponse);
            }
          } catch (error) {
            console.warn('Error fetching today\'s attendance:', error);
          }
        }
        
        // If we still don't have an ID, throw an error
        if (!attendanceId) {
          throw new Error('No active check-in found for today');
        }
      }
      
      console.log('Attempting check-out with ID:', attendanceId);
      
      // Make the check-out API call
      const response = await attendanceAPI.checkOut(attendanceId, {});
      console.log('Check-out API response:', response.data);
      
      // Refresh the attendance data
      console.log('Refreshing attendance data...');
      try {
        await Promise.all([
          dispatch(getTodaysAttendance()),
          dispatch(getMyAttendance())
        ]);
        console.log('Attendance data refreshed successfully');
      } catch (error) {
        console.warn('Error refreshing attendance data:', error);
        // Continue even if refresh fails
      }
      
      // Return the updated attendance record
      return response.data || attendanceRecord;
    } catch (error) {
      console.error('Check-out error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to check out'
      );
    }
  }
);

export const getMyAttendance = createAsyncThunk(
  'attendance/getMyAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getMyAttendance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance records'
      );
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayAttendance: null,
    myAttendance: [],
    allAttendance: [],
    myRequests: [],
    allRequests: [],
    loading: false,
    error: null,
    checkInLoading: false,
    checkOutLoading: false,
    checkInError: null,
    checkOutError: null,
    requestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    requestError: null,
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
    // Check-in
    builder.addCase(checkIn.pending, (state) => {
      state.checkInLoading = true;
      state.checkInError = null;
      state.error = null;
    });
    builder.addCase(checkIn.fulfilled, (state, action) => {
      state.checkInLoading = false;
      state.todayAttendance = action.payload;
      // Update today's record in myAttendance array if it exists
      const today = new Date().toISOString().split('T')[0];
      state.myAttendance = state.myAttendance.map(record => 
        record.date === today ? action.payload : record
      );
    });
    builder.addCase(checkIn.rejected, (state, action) => {
      state.checkInLoading = false;
      state.checkInError = action.payload || 'Failed to check in';
    });

    // Check-out
    builder.addCase(checkOut.pending, (state) => {
      state.checkOutLoading = true;
      state.checkOutError = null;
      state.error = null;
    });
    builder.addCase(checkOut.fulfilled, (state, action) => {
      state.checkOutLoading = false;
      state.todayAttendance = action.payload;
      // Update today's record in myAttendance array if it exists
      const today = new Date().toISOString().split('T')[0];
      state.myAttendance = state.myAttendance.map(record => 
        record.date === today ? action.payload : record
      );
    });
    builder.addCase(checkOut.rejected, (state, action) => {
      state.checkOutLoading = false;
      state.checkOutError = action.payload || 'Failed to check out';
    });

    // Get today's attendance
    builder.addCase(getTodaysAttendance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTodaysAttendance.fulfilled, (state, action) => {
      state.loading = false;
      state.todayAttendance = action.payload;
    });
    builder.addCase(getTodaysAttendance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch today\'s attendance';
    });

    // Get my attendance
    builder.addCase(getMyAttendance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyAttendance.fulfilled, (state, action) => {
      state.loading = false;
      state.myAttendance = action.payload;
      
      // Set today's attendance if available
      if (Array.isArray(action.payload)) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = action.payload.find(record => 
          record.date && record.date.startsWith(today)
        );
        if (todayRecord) {
          state.todayAttendance = todayRecord;
        }
      }
    });
    builder.addCase(getMyAttendance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch attendance records';
    });

    // Get all attendance (admin)
    builder.addCase(getAllAttendance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllAttendance.fulfilled, (state, action) => {
      state.loading = false;
      state.allAttendance = action.payload;
    });
    builder.addCase(getAllAttendance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch all attendance records';
    });
    
    // Get all attendance requests (admin)
    builder.addCase(getAllAttendanceRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllAttendanceRequests.fulfilled, (state, action) => {
      state.loading = false;
      state.allRequests = action.payload;
    });
    builder.addCase(getAllAttendanceRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch attendance requests';
    });

    // Create attendance request
    builder.addCase(createAttendanceRequest.pending, (state) => {
      state.requestStatus = 'loading';
      state.requestError = null;
      state.error = null;
    });
    builder.addCase(createAttendanceRequest.fulfilled, (state, action) => {
      state.requestStatus = 'succeeded';
      
      // Ensure myRequests is an array before using unshift
      if (!Array.isArray(state.myRequests)) {
        state.myRequests = [];
      }
      
      // Add the new request to the beginning of the array
      state.myRequests = [action.payload, ...state.myRequests];
      
      // Also add to allRequests if it exists and is an array
      if (Array.isArray(state.allRequests)) {
        state.allRequests = [action.payload, ...state.allRequests];
      }
    });
    builder.addCase(createAttendanceRequest.rejected, (state, action) => {
      state.requestStatus = 'failed';
      state.requestError = action.payload || 'Failed to create request';
    });
    
    // Get my attendance requests
    builder.addCase(getMyAttendanceRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyAttendanceRequests.fulfilled, (state, action) => {
      // Ensure we store an array, even if the payload is null/undefined
      state.myRequests = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
    });
    builder.addCase(getMyAttendanceRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch attendance requests';
      // Ensure myRequests is still an array even on error
      state.myRequests = [];
    });

    // Update attendance request status
    builder.addCase(updateAttendanceRequestStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAttendanceRequestStatus.fulfilled, (state, action) => {
      state.loading = false;
      const updatedRequest = action.payload;
      
      // Update in myRequests
      state.myRequests = state.myRequests.map(request => 
        request._id === updatedRequest._id ? updatedRequest : request
      );
      
      // Update in allRequests if admin is viewing them
      if (state.allRequests) {
        state.allRequests = state.allRequests.map(request =>
          request._id === updatedRequest._id ? updatedRequest : request
        );
      }
    });
    builder.addCase(updateAttendanceRequestStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update request status';
    });

    // getMyAttendance handler is already defined above with enhanced functionality
  },
});

export const { clearErrors, setTodayAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
