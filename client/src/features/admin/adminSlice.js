import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL for API
const API_URL = 'http://localhost:5002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
  credentials: 'include',
  crossDomain: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure credentials are included for all requests
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        console.error('Unauthorized - redirecting to login');
        // Handle unauthorized (e.g., redirect to login)
      } else if (error.response.status === 403) {
        console.error('Forbidden - insufficient permissions');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const fetchDashboardSummary = createAsyncThunk(
  'admin/fetchDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/summary');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchEmployees = createAsyncThunk(
  'admin/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching employees...');
      const response = await api.get('/admin/employees');
      console.log('Employees response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      return rejectWithValue({
        message: 'Failed to fetch employees',
        details: error.response?.data || error.message,
        status: error.response?.status,
        code: error.code
      });
    }
  }
);

export const fetchEmployeeAttendance = createAsyncThunk(
  'admin/fetchEmployeeAttendance',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/attendance/${employeeId}`);
      return { employeeId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchLeaveRequests = createAsyncThunk(
  'admin/fetchLeaveRequests',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching leave requests...');
      const response = await api.get('/admin/leaves');
      console.log('Leave requests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      return rejectWithValue({
        message: 'Failed to fetch leave requests',
        details: error.response?.data || error.message
      });
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  'admin/updateLeaveStatus',
  async ({ leaveId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/leaves/${leaveId}`, { status });
      toast.success(`Leave request ${status} successfully`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    summary: null,
    employees: [],
    employeeAttendance: {},
    leaveRequests: [],
    loading: {
      dashboard: false,
      employees: false,
      leaves: false
    },
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Summary
    builder.addCase(fetchDashboardSummary.pending, (state) => {
      state.loading.dashboard = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardSummary.fulfilled, (state, action) => {
      state.loading.dashboard = false;
      state.summary = action.payload;
    });
    builder.addCase(fetchDashboardSummary.rejected, (state, action) => {
      state.loading.dashboard = false;
      state.error = action.payload;
    });

    // Employees
    builder.addCase(fetchEmployees.pending, (state) => {
      state.loading.employees = true;
      state.error = null;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.loading.employees = false;
      state.employees = action.payload;
    });
    builder.addCase(fetchEmployees.rejected, (state, action) => {
      state.loading.employees = false;
      state.error = action.payload;
    });

    // Employee Attendance
    builder.addCase(fetchEmployeeAttendance.fulfilled, (state, action) => {
      const { employeeId, data } = action.payload;
      state.employeeAttendance[employeeId] = data;
    });

    // Leave Requests
    builder.addCase(fetchLeaveRequests.pending, (state) => {
      state.loading.leaves = true;
      state.error = null;
    });
    builder.addCase(fetchLeaveRequests.fulfilled, (state, action) => {
      state.loading.leaves = false;
      state.leaveRequests = action.payload;
    });
    builder.addCase(fetchLeaveRequests.rejected, (state, action) => {
      state.loading.leaves = false;
      state.error = action.payload;
    });

    // Update Leave Status
    builder.addCase(updateLeaveStatus.fulfilled, (state, action) => {
      const updatedLeave = action.payload;
      state.leaveRequests = state.leaveRequests.map(leave =>
        leave._id === updatedLeave._id ? updatedLeave : leave
      );
    });
  },
});

export const { clearError } = adminSlice.actions;

export default adminSlice.reducer;
