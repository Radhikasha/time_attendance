import api from './api';

export const leaveAPI = {
  // Create a new leave request
  createLeaveRequest: async (leaveData) => {
    const response = await api.post('/api/leaves', leaveData);
    return response.data;
  },

  // Get all leave requests for the current user
  getMyLeaveRequests: async () => {
    const response = await api.get('/api/leaves/me');
    return response.data;
  },

  // Update a leave request
  updateLeaveRequest: async (id, updateData) => {
    const response = await api.put(`/api/leaves/${id}`, updateData);
    return response.data;
  },

  // Delete a leave request
  deleteLeaveRequest: async (id) => {
    const response = await api.delete(`/api/leaves/${id}`);
    return response.data;
  },
};

export default leaveAPI;
