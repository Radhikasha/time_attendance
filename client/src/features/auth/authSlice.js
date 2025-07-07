import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5002/api/auth';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Authentication failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      return 'Password reset link has been sent to your email';
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset link');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/reset-password/${token}`, { password });
      return 'Password has been reset successfully';
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = null;
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = 'Registration successful';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Add updateUserProfile async thunk
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/profile/${userId}`, 
        userData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update profile failed');
    }
  }
);

export const { logout, clearError, clearMessage } = authSlice.actions;

// Alias for clearError to maintain backward compatibility
export const clearErrors = clearError;
export default authSlice.reducer;
