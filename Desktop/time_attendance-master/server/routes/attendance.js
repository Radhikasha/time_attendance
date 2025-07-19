const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');
const { auth: protect, admin } = require('../middleware/auth');

// Validation middleware
const validateCheckIn = [
    check('notes', 'Notes are optional').optional().isString()
];

const validateCheckOut = [
    check('notes', 'Notes are optional').optional().isString()
];

// Protect all routes with authentication
router.use(protect);

// @route   POST /api/attendance/checkin
// @desc    Check in for the day
// @access  Private
router.post('/checkin', validateCheckIn, attendanceController.checkIn);

// @route   PUT /api/attendance/checkout
// @desc    Check out for the day
// @access  Private
router.put('/checkout', validateCheckOut, attendanceController.checkOut);

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private
router.get('/today', attendanceController.getTodaysAttendance);

// @route   GET /api/attendance/me
// @desc    Get logged in user's attendance history
// @access  Private
router.get('/me', attendanceController.getMyAttendance);

// @route   GET /api/attendance
// @desc    Get all attendance (Admin only)
// @access  Private/Admin
router.get('/', admin, attendanceController.getAllAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (Admin only)
// @access  Private/Admin
router.put(
  '/:id',
  [
    admin,
    check('status', 'Status is required').optional().isIn(['present', 'absent', 'late', 'half-day', 'on-leave'])
  ],
  attendanceController.updateAttendance
);

module.exports = router;
