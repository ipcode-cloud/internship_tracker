import User from '../models/user.model.js';
import Intern from '../models/intern.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, department, role = 'intern' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      department,
      role
    });

    await user.save();

    // If user is an intern, create intern record
    // if (role === 'intern') {
    //   const intern = new Intern({
    //     userId: user._id,
    //     firstName,
    //     lastName,
    //     email,
    //     phone,
    //     department,
    //     position,
    //     startDate: new Date()
    //   });

    //   await intern.save();
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const login =
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token with consistent payload
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('firstName lastName email role department isActive phone')
      .sort({ firstName: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is updating their own profile or is an admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Update user fields
    Object.keys(updates).forEach(key => {
      if (key !== 'password' && key !== 'role') { // Prevent updating password and role through this route
        user[key] = updates[key];
      }
    });

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('firstName lastName email department')
      .sort({ firstName: 1 });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};