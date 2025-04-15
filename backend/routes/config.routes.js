import express from 'express';
import { body, validationResult } from 'express-validator';
import Config from '../models/config.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';
import { getConfig, createConfig, updateConfig, deleteConfig } from '../controllers/config.controller.js';

const router = express.Router();

// // Public endpoint to get departments (no auth required)
// router.get('/departments', async (req, res) => {
//   try {
//     const config = await Config.findOne();
//     if (!config) {
//       return res.json([]);
//     }
//     res.json(config.departments || []);
//   } catch (error) {
//     console.error('Error fetching departments:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Public endpoint to get positions (no auth required)
// router.get('/positions', async (req, res) => {
//   try {
//     const config = await Config.findOne();
//     if (!config) {
//       return res.json([]);
//     }
//     res.json(config.positions || []);
//   } catch (error) {
//     console.error('Error fetching positions:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Public route to get config
router.get('/', getConfig);

// Protected routes for admin
router.post('/', auth, checkRole(['admin']), createConfig);
router.put('/:id', auth, checkRole(['admin']), updateConfig);
router.delete('/:id', auth, checkRole(['admin']), deleteConfig);

export default router; 