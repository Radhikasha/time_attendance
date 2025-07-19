const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
        default: 'present'
    },
    notes: {
        type: String
    },
    totalHours: {
        type: Number
    }
}, {
    timestamps: true
});

// Calculate total working hours before saving
attendanceSchema.pre('save', function(next) {
    if (this.checkOut) {
        const diffInMs = this.checkOut - this.checkIn;
        this.totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2);
    }
    next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
