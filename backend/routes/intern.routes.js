import express from 'express';
import { body, validationResult } from 'express-validator';
import Intern from '../models/intern.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all interns (admin and mentor only)
router.get('/', auth, checkRole(['admin', 'mentor']), async (req, res) => {
  try {
    const interns = await Intern.find()
      .populate('mentor', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(interns);
  } catch (error) {
    console.error('Error fetching interns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get intern by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id)
      .populate('mentor', 'firstName lastName email');
    
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // Only allow access if user is admin, mentor, or the intern's mentor
    if (req.user.role !== 'admin' && 
        req.user.role !== 'mentor' && 
        req.user._id.toString() !== intern.mentor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(intern);
  } catch (error) {
    console.error('Error fetching intern:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new intern (admin only)
router.post('/',
  auth,
  checkRole(['admin']),
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty(),
    body('department').trim().notEmpty(),
    body('position').trim().notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('mentor').isMongoId()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const intern = new Intern(req.body);
      await intern.save();
      res.status(201).json(intern);
    } catch (error) {
      console.error('Error creating intern:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update intern (admin only)
router.put('/:id',
  auth,
  checkRole(['admin']),
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().notEmpty(),
    body('department').optional().trim().notEmpty(),
    body('position').optional().trim().notEmpty(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('mentor').optional().isMongoId(),
    body('status').optional().isIn(['active', 'inactive', 'completed', 'terminated', 'extended', 'on_leave'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const intern = await Intern.findById(req.params.id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }

      // Update intern fields
      Object.keys(req.body).forEach(key => {
        intern[key] = req.body[key];
      });

      await intern.save();
      res.json(intern);
    } catch (error) {
      console.error('Error updating intern:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete intern (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    await intern.deleteOne();
    res.json({ message: 'Intern deleted successfully' });
  } catch (error) {
    console.error('Error deleting intern:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update completed status for all interns whose end date has passed
router.put('/batch/complete-expired',
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      // Find and update all interns whose end date is in the past and status is still 'active'
      const result = await Intern.updateMany(
        {
          endDate: { $lt: new Date() },
          status: 'active'
        },
        {
          $set: { 
            status: 'completed',
            updatedAt: new Date()
          }
        }
      );

      res.json({
        message: 'Internship statuses updated successfully',
        updated: result.modifiedCount
      });
    } catch (error) {
      console.error('Error updating expired internships:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 