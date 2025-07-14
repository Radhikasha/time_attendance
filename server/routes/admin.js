const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  testAdminRoute,
  getEmployees,
  getEmployeeAttendance,
  getDashboardSummary,
  getLeaveRequests,
  updateLeaveStatus,
  getAttendanceRequests,
  updateAttendanceRequestStatus
} = require('../controllers/adminController');

// Apply protect middleware to all routes
const checkAdmin = [
  // First check if user is authenticated
  (req, res, next) => {
    console.log('Checking authentication for path:', req.path);
    protect(req, res, next);
  },
  // Then check if user is admin
  (req, res, next) => {
    console.log('Checking admin access for user:', req.user?.id);
    if (req.user && req.user.role === 'admin') {
      console.log('Admin access granted');
      return next();
    }
    console.log('Admin access denied');
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
];

// Apply both middlewares to all routes in this router
router.use(checkAdmin);

// Test route to verify admin access
router.get('/test', testAdminRoute);

// Employee management
router.get('/employees', getEmployees);
router.get('/attendance/:employeeId', getEmployeeAttendance);

// Dashboard
router.get('/summary', getDashboardSummary);

// Leave management
router.get('/leaves', getLeaveRequests);
router.put('/leaves/:leaveId', updateLeaveStatus);

// Attendance requests management
router.get('/attendance-requests', getAttendanceRequests);
router.put('/attendance-requests/:requestId', updateAttendanceRequestStatus);

module.exports = router;
