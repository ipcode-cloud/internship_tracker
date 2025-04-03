import express from 'express';
import { body, validationResult } from 'express-validator';
import Config from '../models/config.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public endpoint to get departments (no auth required)
router.get('/departments', async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.json([]);
    }
    res.json(config.departments || []);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get configuration (admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      // Create default config if none exists
      config = new Config({
        companyName: 'Company Name',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        departments: [],
        positions: []
      });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update configuration (admin only)
router.put('/',
  auth,
  checkRole(['admin']),
  [
    body('companyName').trim().notEmpty(),
    body('workingHours.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('workingHours.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('departments').isArray(),
    body('positions').isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let config = await Config.findOne();
      if (!config) {
        config = new Config(req.body);
      } else {
        Object.assign(config, req.body);
      }
      await config.save();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 