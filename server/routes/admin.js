const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeAttendance,
  getDashboardSummary,
  getLeaveRequests,
  updateLeaveStatus
} = require('../controllers/adminController');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

// Employee management
router.get('/employees', getEmployees);
router.get('/attendance/:employeeId', getEmployeeAttendance);

// Dashboard
router.get('/summary', getDashboardSummary);

// Leave management
router.get('/leaves', getLeaveRequests);
router.put('/leaves/:leaveId', updateLeaveStatus);

module.exports = router;
