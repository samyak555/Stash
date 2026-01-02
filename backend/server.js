// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { verifySMTPConnection } from './utils/emailService.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK',
    database: dbStatus
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Don't exit in production, just log
});

// Start server only after DB connection
const startServer = async () => {
  try {
    console.log('📦 Starting server...');
    console.log('📋 Environment check:');
    console.log(`   PORT: ${process.env.PORT || 'not set (using default 5000)'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : '❌ NOT SET'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : '❌ NOT SET'}`);
    
    // Validate environment variables before starting
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('   Please set MONGODB_URI in Render dashboard → Environment');
      process.exit(1);
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is not set');
      console.error('   Please set JWT_SECRET in Render dashboard → Environment');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connection established');
    
    // Verify Gmail SMTP connection (production requirement)
    console.log('📧 Verifying Gmail SMTP connection...');
    try {
      await verifySMTPConnection();
    } catch (emailError) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Cannot start in production without working email service');
        process.exit(1);
      } else {
        console.warn('⚠️  Email service not available - continuing without email functionality');
      }
    }
    
    console.log(`🚀 Starting server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`✅ Server running successfully on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server');
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    if (error.stack) {
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Handle any uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('   Error name:', error.name);
  console.error('   Stack:', error.stack);
  process.exit(1);
});

// Wrap everything in try-catch to catch any import errors
try {
  startServer();
} catch (error) {
  console.error('❌ Failed to initialize server');
  console.error('   Error type:', error.name);
  console.error('   Error message:', error.message);
  if (error.stack) {
    console.error('   Stack trace:', error.stack);
  }
  process.exit(1);
}


