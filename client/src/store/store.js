import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
