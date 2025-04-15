import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/attendance.model.js';
import Intern from '../models/intern.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';
import { createAttendance, deleteAttendance, getAllAttendance, getAttendance, getAttendanceByDateRange, updateAttendance } from '../controllers/attendance.controller.js';

const router = express.Router();

// Get all attendance records
router.get('/',
  auth,
  getAllAttendance
);

// Get attendance records for an intern
router.get('/intern/:internId',
  auth,
  checkRole(['admin', 'mentor']),
  getAttendance
);

// Get attendance records for a specific date range
router.get('/range',
  auth,
  checkRole(['admin', 'mentor']),
  getAttendanceByDateRange
);

// Get attendance records for current user (for interns)
router.get('/my-attendance',
  auth,
  async (req, res) => {
    try {
      // If user is an intern, find their intern record first
      if (req.user.role === 'intern') {
        const intern = await Intern.findOne({ email: req.user.email });
        if (!intern) {
          return res.status(404).json({ message: 'Intern record not found' });
        }
        
        const attendance = await Attendance.find({ intern: intern._id })
          .populate('markedBy', 'firstName lastName')
          .sort({ date: -1 });
        return res.json(attendance);
      }
      
      // For admin and mentor, return all attendance
      const attendance = await Attendance.find()
        .populate('intern', 'firstName lastName department')
        .populate('markedBy', 'firstName lastName')
        .sort({ date: -1 });
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Mark attendance
router.post('/',
  auth,
  checkRole(['admin', 'mentor']),
  createAttendance
);

// Update attendance
router.put('/:id',
  auth,
  checkRole(['admin', 'mentor']),
  updateAttendance
);

// Delete attendance
router.delete('/:id',
  auth,
  checkRole(['admin','mentor']),
  deleteAttendance
);

export default router; 