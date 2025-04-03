import Attendance from '../models/attendance.model.js';
import Intern from '../models/intern.model.js';

// Get all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('intern', 'firstName lastName email department')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single attendance record
export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('intern', 'firstName lastName email department')
      .populate('markedBy', 'firstName lastName');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new attendance record
export const createAttendance = async (req, res) => {
  try {
    // Check if intern exists
    const intern = await Intern.findById(req.body.intern);
    if (!intern) {
      return res.status(400).json({ message: 'Invalid intern selected' });
    }

    // Check for existing attendance record for the same date
    const existingAttendance = await Attendance.findOne({
      intern: req.body.intern,
      date: req.body.date
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    const attendance = new Attendance({
      ...req.body,
      markedBy: req.user._id // Assuming user info is available in req.user
    });
    
    const savedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate('intern', 'firstName lastName email department')
      .populate('markedBy', 'firstName lastName');
    
    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('intern', 'firstName lastName email department')
    .populate('markedBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by intern
export const getAttendanceByIntern = async (req, res) => {
  try {
    const attendance = await Attendance.find({ intern: req.params.internId })
      .populate('intern', 'firstName lastName email department')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by date range
export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('intern', 'firstName lastName email department')
    .populate('markedBy', 'firstName lastName')
    .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const { internId, startDate, endDate } = req.query;
    const query = {};

    if (internId) {
      query.intern = internId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 