import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/attendance.model.js';
import Intern from '../models/intern.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get attendance records for an intern
router.get('/intern/:internId',
  auth,
  checkRole(['admin', 'mentor']),
  async (req, res) => {
    try {
      const attendance = await Attendance.find({ intern: req.params.internId })
        .populate('markedBy', 'firstName lastName')
        .sort({ date: -1 });
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get attendance records for a specific date range
router.get('/range',
  auth,
  checkRole(['admin', 'mentor']),
  [
    body('startDate').isISO8601(),
    body('endDate').isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate } = req.body;
      const attendance = await Attendance.find({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
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
  [
    body('intern').isMongoId(),
    body('date').isISO8601(),
    body('status').isIn(['present', 'absent', 'late', 'half-day']),
    body('checkIn').optional().isISO8601(),
    body('checkOut').optional().isISO8601(),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if intern exists and is active
      const intern = await Intern.findById(req.body.intern);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }
      if (intern.status !== 'active') {
        return res.status(400).json({ message: 'Intern is not active' });
      }

      // Check if attendance already exists for this date
      const existingAttendance = await Attendance.findOne({
        intern: req.body.intern,
        date: new Date(req.body.date).setHours(0, 0, 0, 0)
      });

      if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for this date' });
      }

      const attendance = new Attendance({
        ...req.body,
        markedBy: req.user._id
      });

      await attendance.save();
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update attendance record
router.put('/:id',
  auth,
  checkRole(['admin', 'mentor']),
  [
    body('status').optional().isIn(['present', 'absent', 'late', 'half-day']),
    body('checkIn').optional().isISO8601(),
    body('checkOut').optional().isISO8601(),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      // Update fields
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          attendance[key] = req.body[key];
        }
      });

      await attendance.save();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete attendance record
router.delete('/:id',
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      await attendance.remove();
      res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 