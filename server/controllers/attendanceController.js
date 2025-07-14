const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Check-in employee
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if user has already checked in today
        const existingAttendance = await Attendance.findOne({
            user: req.user.id,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (existingAttendance) {
            if (existingAttendance.checkIn && !existingAttendance.checkOut) {
                return res.status(400).json({ 
                    success: false,
                    message: 'You have already checked in today',
                    attendance: existingAttendance
                });
            }
        }

        const attendance = new Attendance({
            user: req.user.id,
            date: today,
            checkIn: new Date(),
            status: 'present'
        });

        await attendance.save();
        
        // Populate user details for the response
        await attendance.populate('user', ['name', 'email', 'employeeId']);
        
        res.status(201).json({
            success: true,
            message: 'Checked in successfully',
            attendance
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during check-in',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Check-out employee
// @route   PUT /api/attendance/checkout
// @access  Private
exports.checkOut = async (req, res) => {
    console.log('Check-out request received. Body:', req.body);
    console.log('Authenticated user:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // First try to find by ID if provided
        let attendance;
        if (req.body.attendanceId) {
            console.log('Looking for attendance record by ID:', req.body.attendanceId);
            attendance = await Attendance.findOne({
                _id: req.body.attendanceId,
                user: req.user.id
            });
        }
        
        // If not found by ID, try to find by date range
        if (!attendance) {
            console.log('Looking for attendance record for user:', req.user.id, 'between', today, 'and', tomorrow);
            attendance = await Attendance.findOne({
                user: req.user.id,
                date: {
                    $gte: today,
                    $lt: tomorrow
                },
                checkIn: { $exists: true },
                checkOut: { $exists: false }
            });
        }

        console.log('Found attendance record:', attendance);

        if (!attendance) {
            console.error('No attendance record found for today');
            return res.status(400).json({
                success: false,
                message: 'No check-in record found for today'
            });
        }

        // Check if already checked out
        if (attendance.checkOut) {
            console.log('User already checked out at:', attendance.checkOut);
            return res.status(400).json({
                success: false,
                message: 'You have already checked out today',
                attendance
            });
        }

        // Update check-out time
        const checkOutTime = new Date();
        attendance.checkOut = checkOutTime;
        
        console.log('Setting check-out time to:', checkOutTime);
        
        // Calculate total working hours
        const diffInMs = attendance.checkOut - attendance.checkIn;
        attendance.totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2);
        
        console.log('Saving attendance record...');
        await attendance.save();
        
        // Populate user details for the response
        await attendance.populate('user', ['name', 'email', 'employeeId']);
        
        console.log('Check-out successful for user:', req.user.id);
        
        res.json({
            success: true,
            message: 'Checked out successfully',
            attendance
        });
    } catch (err) {
        console.error('Check-out error:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({
            success: false,
            message: 'Server error during check-out',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodaysAttendance = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await Attendance.findOne({
            user: req.user.id,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.json({
            success: true,
            data: attendance || null
        });
    } catch (err) {
        console.error('Get today\'s attendance error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s attendance',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get all attendance records for a user
// @route   GET /api/attendance/me
// @access  Private
exports.getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id })
            .sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance
// @access  Private/Admin
exports.getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('user', ['name', 'email', 'employeeId', 'department', 'position'])
            .sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin
exports.updateAttendance = async (req, res) => {
    try {
        const { checkIn, checkOut, status, notes } = req.body;
        
        let attendance = await Attendance.findById(req.params.id);
        
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Update fields
        if (checkIn) attendance.checkIn = checkIn;
        if (checkOut) attendance.checkOut = checkOut;
        if (status) attendance.status = status;
        if (notes !== undefined) attendance.notes = notes;

        // Recalculate total hours if checkOut is updated
        if (checkOut && attendance.checkIn) {
            const diffInMs = new Date(checkOut) - new Date(attendance.checkIn);
            attendance.totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2);
        }

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
