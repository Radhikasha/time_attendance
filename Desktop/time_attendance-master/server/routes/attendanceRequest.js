const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  getRequestById
} = require('../controllers/attendanceRequestController');

// Validation middleware
const validateRequest = [
  check('date', 'Date is required').not().isEmpty(),
  check('type', 'Type is required').isIn(['regularization', 'leave', 'half-day', 'work-from-home']),
  check('reason', 'Reason is required').not().isEmpty(),
  check('checkIn')
    .if((value, { req }) => req.body.type === 'regularization')
    .notEmpty()
    .withMessage('Check-in time is required for regularization requests'),
  check('checkOut')
    .if((value, { req }) => req.body.type === 'regularization')
    .notEmpty()
    .withMessage('Check-out time is required for regularization requests')
    .custom((value, { req }) => {
      if (req.body.checkIn && new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out time must be after check-in time');
      }
      return true;
    })
];

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/attendance/requests
// @desc    Create a new attendance request
// @access  Private
router.post('/', validateRequest, createRequest);

// @route   GET /api/attendance/requests/me
// @desc    Get all attendance requests for the logged-in user
// @access  Private
router.get('/me', getMyRequests);

// @route   GET /api/attendance/requests/:id
// @desc    Get a single attendance request by ID
// @access  Private
router.get('/:id', getRequestById);

// Admin routes
router.use(admin);

// @route   GET /api/attendance/requests
// @desc    Get all attendance requests (Admin)
// @access  Private/Admin
router.get('/', getAllRequests);

// @route   PUT /api/attendance/requests/:id/status
// @desc    Update attendance request status (Approve/Reject)
// @access  Private/Admin
router.put(
  '/:id/status',
  [
    check('status', 'Status is required').isIn(['approved', 'rejected']),
    check('adminComment')
      .if((value, { req }) => req.body.status === 'rejected')
      .notEmpty()
      .withMessage('Comment is required when rejecting a request')
  ],
  updateRequestStatus
);

module.exports = router;
