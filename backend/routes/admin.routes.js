import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.middleware.js';
import Config from '../models/config.model.js';
import Intern from '../models/intern.model.js';

const router = express.Router();

// Delete inactive or terminated interns
router.delete('/interns/cleanup',
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const result = await Intern.deleteMany({
        status: { $in: ['inactive', 'terminated'] }
      });

      res.json({
        message: 'Inactive and terminated interns deleted successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all configuration values
router.get('/config',
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const configs = await Config.find();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add new configuration values
router.post('/config',
  auth,
  checkRole(['admin']),
  [
    body('type').isIn(['department', 'status', 'performanceRating', 'notes']),
    body('values').isArray().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, values } = req.body;

      // Check if configuration type already exists
      let config = await Config.findOne({ type });
      
      if (config) {
        // Update existing values
        config.values = [...new Set([...config.values, ...values])]; // Remove duplicates
        await config.save();
      } else {
        // Create new configuration
        config = new Config({
          type,
          values
        });
        await config.save();
      }

      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Remove configuration values
router.delete('/config/:type/:value',
  auth,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { type, value } = req.params;
      
      const config = await Config.findOne({ type });
      if (!config) {
        return res.status(404).json({ message: 'Configuration not found' });
      }

      config.values = config.values.filter(v => v !== value);
      await config.save();

      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 