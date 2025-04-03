import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  workingHours: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  departments: [{
    type: String,
    trim: true
  }],
  positions: [{
    type: String,
    trim: true
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
configSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Config', configSchema); 