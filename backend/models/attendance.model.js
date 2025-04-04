import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
    required: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date;
      },
      message: 'Date must be a valid date'
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    required: true
  },
  checkIn: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || (this.status !== 'absent' && v instanceof Date);
      },
      message: 'Check-in time is required for non-absent status'
    }
  },
  checkOut: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || (this.status !== 'absent' && v instanceof Date && (!this.checkIn || v > this.checkIn));
      },
      message: 'Check-out time must be after check-in time'
    }
  },
  notes: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ intern: 1, date: 1 }, { unique: true });

// Pre-save middleware to validate check-in and check-out times
attendanceSchema.pre('save', function(next) {
  if (this.status !== 'absent') {
    if (!this.checkIn) {
      next(new Error('Check-in time is required for non-absent status'));
      return;
    }
    if (!this.checkOut) {
      next(new Error('Check-out time is required for non-absent status'));
      return;
    }
    if (this.checkOut <= this.checkIn) {
      next(new Error('Check-out time must be after check-in time'));
      return;
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 