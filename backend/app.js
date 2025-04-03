import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import internRoutes from './routes/intern.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import configRoutes from './routes/config.routes.js';
import connectDB from "./config/db.js"
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 