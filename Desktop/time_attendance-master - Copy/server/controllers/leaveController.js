const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        
        // Check if dates are valid
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        
        if (end < start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }
        
        // Check for overlapping leave requests
        const overlappingLeave = await Leave.findOne({
            user: req.user.id,
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ],
            status: { $ne: 'rejected' }
        });
        
        if (overlappingLeave) {
            return res.status(400).json({ 
                message: 'You already have a leave request that overlaps with these dates' 
            });
        }
        
        const leave = new Leave({
            user: req.user.id,
            leaveType,
            startDate: start,
            endDate: end,
            reason
        });
        
        await leave.save();
        
        // Populate user details for the response
        await leave.populate('user', 'name email');
        
        res.status(201).json(leave);
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's leave requests
// @route   GET /api/leaves/me
// @route   GET /api/leaves/employee/:userId
// @access  Private
exports.getMyLeaveRequests = async (req, res) => {
    try {
        // Use userId from params if provided (for admin/manager access), otherwise use authenticated user
        const userId = req.params.userId || req.user.id;
        
        // If accessing another user's data, verify admin privileges
        if (req.params.userId && req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this user\'s leave requests' });
        }
        
        const leaves = await Leave.find({ user: userId })
            .sort({ startDate: -1 })
            .populate('user', 'name email');
            
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a leave request
// @route   PUT /api/leaves/:id
// @access  Private
exports.updateLeaveRequest = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, status } = req.body;
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        
        // Check if the user is the owner of the leave request or an admin
        if (leave.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this leave request' });
        }
        
        // Only allow updating status if the user is an admin
        if (status && req.user.role === 'admin') {
            leave.status = status;
            leave.approvedBy = req.user.id;
        } else if (status) {
            return res.status(403).json({ message: 'Not authorized to update leave status' });
        }
        
        // Only allow updating other fields if the leave is still pending
        if (leave.status === 'pending') {
            if (leaveType) leave.leaveType = leaveType;
            if (startDate) leave.startDate = startDate;
            if (endDate) leave.endDate = endDate;
            if (reason) leave.reason = reason;
        } else {
            return res.status(400).json({ message: 'Cannot update a processed leave request' });
        }
        
        await leave.save();
        
        // Populate user details for the response
        await leave.populate('user', 'name email');
        
        res.json(leave);
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a leave request
// @route   DELETE /api/leaves/:id
// @access  Private
exports.deleteLeaveRequest = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        
        // Check if the user is the owner of the leave request or an admin
        if (leave.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this leave request' });
        }
        
        // Only allow deleting pending leave requests
        if (leave.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot delete a processed leave request' });
        }
        
        await Leave.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Leave request removed' });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
