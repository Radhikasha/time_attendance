const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createLeaveRequest,
  getMyLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest
} = require('../controllers/leaveController');

// All routes are protected
router.use(protect);

// Create a new leave request
router.post('/', createLeaveRequest);

// Get all leave requests for the logged-in user
router.get('/me', getMyLeaveRequests);

// Update a leave request
router.put('/:id', updateLeaveRequest);

// Delete a leave request
router.delete('/:id', deleteLeaveRequest);

module.exports = router;
