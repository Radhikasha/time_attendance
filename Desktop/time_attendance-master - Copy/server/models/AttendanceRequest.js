const mongoose = require('mongoose');

const AttendanceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['regularization', 'leave', 'half-day', 'work-from-home'],
    required: true
  },
  checkIn: {
    type: Date,
    required: function() {
      return this.type === 'regularization';
    }
  },
  checkOut: {
    type: Date,
    required: function() {
      return this.type === 'regularization';
    },
    validate: {
      validator: function(v) {
        if (this.type !== 'regularization') return true;
        return !this.checkIn || !v || v > this.checkIn;
      },
      message: 'Check-out time must be after check-in time'
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminComment: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
AttendanceRequestSchema.index({ user: 1, date: 1 });
AttendanceRequestSchema.index({ status: 1 });

// Add virtual for formatted date
AttendanceRequestSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Pre-save hook to validate request
AttendanceRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.processedAt = new Date();
  }
  next();
});

// Static method to get requests by user
AttendanceRequestSchema.statics.findByUser = function(userId, status) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name email employeeId')
    .populate('processedBy', 'name');
};

// Static method to get all requests with optional status filter
AttendanceRequestSchema.statics.findAllRequests = function(status) {
  const query = {};
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name email employeeId')
    .populate('processedBy', 'name');
};

// Method to update status
AttendanceRequestSchema.methods.updateStatus = async function(newStatus, adminId, comment) {
  this.status = newStatus;
  this.processedBy = adminId;
  this.processedAt = new Date();
  if (comment) {
    this.adminComment = comment;
  }
  return this.save();
};

// Check if request can be processed
AttendanceRequestSchema.methods.canProcess = function() {
  return this.status === 'pending';
};

module.exports = mongoose.model('AttendanceRequest', AttendanceRequestSchema);
