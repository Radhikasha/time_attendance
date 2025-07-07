import axios from 'axios';

// Force the API URL to use port 5002
const API_URL = 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is a refresh token request, redirect to login
      if (originalRequest.url.includes('/auth/refresh-token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Try to refresh the token
      originalRequest._retry = true;
      return api.post('/auth/refresh-token')
        .then(({ data }) => {
          const { token } = data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['x-auth-token'] = token;
          originalRequest.headers['x-auth-token'] = token;
          return api(originalRequest);
        })
        .catch((err) => {
          // If refresh token fails, logout user
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  loadUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => 
    api.post(`/auth/reset-password/${token}`, { password }),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  updateLastLogin: (userId) => api.put(`/users/${userId}/last-login`),
};

// Attendance API
export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (attendanceId, data) => 
    api.put(`/attendance/checkout/${attendanceId}`, data),
  getMyAttendance: (params) => 
    api.get('/attendance/me', { params }),
  getAllAttendance: (params) => 
    api.get('/attendance', { params }),
  updateAttendance: (id, data) => 
    api.put(`/attendance/${id}`, data),
  getAttendanceSummary: (params) =>
    api.get('/attendance/summary', { params }),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Export the configured axios instance
export default api;
