const AttendanceRequest = require('../models/AttendanceRequest');
const { validationResult } = require('express-validator');

// @desc    Create a new attendance request
// @route   POST /api/attendance/requests
// @access  Private
exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { date, type, checkIn, checkOut, reason } = req.body;
    
    // Check for existing request for the same date
    const existingRequest = await AttendanceRequest.findOne({
      user: req.user.id,
      date: new Date(date),
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this date'
      });
    }

    const request = new AttendanceRequest({
      user: req.user.id,
      date: new Date(date),
      type,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      reason
    });

    await request.save();
    
    // Populate user details for the response
    await request.populate('user', 'name email employeeId');

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error('Error creating attendance request:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get all attendance requests for the logged-in user
// @route   GET /api/attendance/requests/me
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await AttendanceRequest.findByUser(req.user.id, status);
    
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching attendance requests:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get all attendance requests (Admin)
// @route   GET /api/attendance/requests
// @access  Private/Admin
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await AttendanceRequest.findAllRequests(status);
    
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching all attendance requests:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Update attendance request status (Approve/Reject)
// @route   PUT /api/attendance/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "approved" or "rejected"'
      });
    }

    const request = await AttendanceRequest.findById(req.params.id)
      .populate('user', 'name email employeeId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (!request.canProcess()) {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    // Update the request status
    await request.updateStatus(status, req.user.id, adminComment);
    
    // If approved and it's a regularization request, update the attendance record
    if (status === 'approved' && request.type === 'regularization') {
      // Here you would typically update the actual attendance record
      // This is a placeholder for that logic
      console.log(`Updating attendance record for user ${request.user._id} on ${request.date}`);
      // await updateAttendanceRecord(request);
    }

    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get a single attendance request
// @route   GET /api/attendance/requests/:id
// @access  Private
exports.getRequestById = async (req, res) => {
  try {
    const request = await AttendanceRequest.findById(req.params.id)
      .populate('user', 'name email employeeId')
      .populate('processedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if the user is authorized to view this request
    if (request.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error('Error fetching request:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
