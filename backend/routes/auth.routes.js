import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import Intern from '../models/intern.model.js';
import { auth, checkRole } from '../middleware/auth.middleware.js';
import { getAllMentors, getAllUsers, getCurrentUser, login, register, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

// Register new user
router.post('/register',register
);

// Login user
router.post('/login',login
);

// Get current user
router.get('/me', auth, getCurrentUser);

// Get all mentors
router.get('/mentors', auth, getAllMentors);

// Get all users
router.get('/users', auth, getAllUsers);

// Update user profile
router.put('/update/:userId', auth, updateUser);

export default router; 