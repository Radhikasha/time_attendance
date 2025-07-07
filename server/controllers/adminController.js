const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

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
        const { status } = req.body;
        const { leaveId } = req.params;
        
        const leave = await Leave.findById(leaveId);
        
        if (!leave) {
            return res.status(404).json({ msg: 'Leave request not found' });
        }
        
        leave.status = status;
        leave.processedBy = req.user.id;
        await leave.save();
        
        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
