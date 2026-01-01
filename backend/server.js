import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { isConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import transactionScheduler from './services/scheduler.js';

// Load environment variables
dotenv.config();

const app = express();

// Get PORT from environment, default to 5000 for local development
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration
// In production, replace '*' with your frontend domain
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*' // Use specific domain in production
    : '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
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
app.use('/api/transactions', transactionRoutes);

// Health check endpoint - checks actual database connection
app.get('/api/health', (req, res) => {
  const dbStatus = isConnected() ? 'connected' : 'disconnected';
  
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Stash Finance API is running',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses',
      income: '/api/income',
      budgets: '/api/budgets',
      goals: '/api/goals',
      dashboard: '/api/dashboard',
      transactions: '/api/transactions',
      health: '/api/health',
    },
  });
});

// Global error handlers for production safety
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // In production, you might want to log to a service like Sentry
  if (NODE_ENV === 'production') {
    // Gracefully exit in production
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Exit process on uncaught exception
  process.exit(1);
});

// Start server only after MongoDB connection is established
const startServer = async () => {
  try {
    console.log('🚀 Starting Stash Finance API...');
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}`);

    // Connect to database FIRST - server won't start if this fails
    await connectDB();

    // Start transaction scheduler AFTER DB connection is established
    console.log('⏰ Starting transaction scheduler...');
    transactionScheduler.startScheduler();

    // Start HTTP server ONLY after DB connection is successful
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log('✅ All systems ready!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('⚠️  Server will not start without database connection');
    
    // Exit with error code in production
    if (NODE_ENV === 'production') {
      process.exit(1);
    } else {
      // In development, exit but allow for debugging
      console.error('💡 Check your MongoDB connection string and network access');
      process.exit(1);
    }
  }
};

// Start the application
startServer();
