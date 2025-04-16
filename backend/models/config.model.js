import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    default: 'Company Name'
  },
  workingHours: {
    start: {
      type: String,
      required: true,
      default: '09:00'
    },
    end: {
      type: String,
      required: true,
      default: '17:00'
    }
  },
  departments: [{
    type: String,
    trim: true
  }],
  positions: {
    type: Map,
    of: [String],
    default: {}
  }
}, {
  timestamps: true
});

const Config = mongoose.model('Config', configSchema);

export default Config; 