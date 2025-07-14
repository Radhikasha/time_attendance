const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const AttendanceRequest = require('../models/AttendanceRequest');

// @desc    Test admin route
// @route   GET /api/admin/test
// @access  Private/Admin
exports.testAdminRoute = async (req, res) => {
    try {
        console.log('Test admin route hit');
        res.json({
            success: true,
            message: 'Admin route is working',
            user: req.user
        });
    } catch (err) {
        console.error('Test admin route error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
exports.getEmployees = async (req, res) => {
    try {
        console.log('Fetching all employees...');
        const employees = await User.find({ $or: [{ role: 'employee' }, { role: 'admin' }] })
            .select('-password')
            .sort({ name: 1 });
        
        console.log(`Found ${employees.length} employees`);
        res.json(employees);
    } catch (err) {
        console.error('Error in getEmployees:', {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get employee attendance
// @route   GET /api/admin/attendance/:employeeId
// @access  Private/Admin
exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.query;
        
        let query = { user: employeeId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendance = await Attendance.find(query)
            .sort({ date: -1 });
            
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get dashboard summary
// @route   GET /api/admin/summary
// @access  Private/Admin
exports.getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [
            totalEmployees,
            presentToday,
            pendingLeaves
        ] = await Promise.all([
            User.countDocuments({ role: 'employee' }),
            Attendance.countDocuments({ 
                date: { $gte: today },
                status: 'present' 
            }),
            Leave.countDocuments({ status: 'pending' })
        ]);
        
        res.json({
            totalEmployees,
            presentToday,
            pendingLeaves
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all leave requests
// @route   GET /api/admin/leaves
// @access  Private/Admin
exports.getLeaveRequests = async (req, res) => {
    try {
        console.log('Fetching all leave requests...');
        
        // Verify Leave model is available
        if (!Leave) {
            console.error('Leave model is not defined');
            return res.status(500).json({ message: 'Leave model not available' });
        }

        const leaves = await Leave.find({})
            .populate('user', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${leaves.length} leave requests`);
        res.json(leaves);
    } catch (err) {
        console.error('Error in getLeaveRequests:', err);
        res.status(500).json({ 
            message: 'Failed to fetch leave requests',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Update leave status
// @route   PUT /api/admin/leaves/:leaveId
// @access  Private/Admin
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.leaveId);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        leave.status = status;
        leave.adminComment = adminComment || '';
        await leave.save();

        res.json(leave);
    } catch (err) {
        console.error('Error updating leave status:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get all attendance requests
// @route   GET /api/admin/attendance-requests
// @access  Private/Admin
exports.getAttendanceRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        
        if (status) {
            query.status = status;
        }

        const requests = await AttendanceRequest.find(query)
            .populate('user', 'name email employeeId')
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 });

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

// @desc    Update attendance request status
// @route   PUT /api/admin/attendance-requests/:requestId
// @access  Private/Admin
exports.updateAttendanceRequestStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be either "approved" or "rejected"'
            });
        }

        const request = await AttendanceRequest.findById(req.params.requestId)
            .populate('user', 'name email employeeId');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Attendance request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        // Update the request status
        request.status = status;
        request.processedBy = req.user.id;
        request.processedAt = new Date();
        
        if (adminComment) {
            request.adminComment = adminComment;
        }

        await request.save();

        // If approved and it's a regularization request, update the attendance record
        if (status === 'approved' && request.type === 'regularization') {
            try {
                // Find or create attendance record
                const attendanceDate = new Date(request.date);
                const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

                let attendance = await Attendance.findOne({
                    user: request.user._id,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });

                if (!attendance) {
                    attendance = new Attendance({
                        user: request.user._id,
                        date: request.date,
                        status: 'present'
                    });
                }

                // Update check-in and check-out times
                attendance.checkIn = request.checkIn || attendance.checkIn;
                attendance.checkOut = request.checkOut || attendance.checkOut;
                attendance.updatedAt = new Date();
                attendance.notes = `Updated via attendance request (ID: ${request._id})`;
                
                await attendance.save();
            } catch (attendanceError) {
                console.error('Error updating attendance record:', attendanceError);
                // Don't fail the request if attendance update fails
                // Just log it and continue
            }
        }

        res.json({
            success: true,
            data: request
        });
    } catch (err) {
        console.error('Error updating attendance request status:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
