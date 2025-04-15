import mongoose from 'mongoose';

const internSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: [
      'IT',
      'Software Development',
      'Data Science',
      'UI/UX',
      'Marketing',
      'HR',
      'Finance',
      'Operations',
      'Networking'
    ],
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: [
      'active',
      'completed',
      'on_leave'
    ],
    default: 'active'
  },
  performanceRating: {
    type: String,
    enum: ['excellent', 'good', 'average', 'needs_improvement'],
    default: 'average'
  },
  projectStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
internSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Intern', internSchema); 