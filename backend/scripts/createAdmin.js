import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@intern-tracker.com',
      password: 'Admin@123', // This will be hashed by the pre-save middleware
      role: 'admin',
      department: 'Administration',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password: Admin@123');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createAdmin(); 