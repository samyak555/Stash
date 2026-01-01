import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (set up before routes)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (set up before server starts, but won't execute queries until DB is connected)
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

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stash Finance API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses',
      income: '/api/income',
      budgets: '/api/budgets',
      goals: '/api/goals',
      dashboard: '/api/dashboard',
      transactions: '/api/transactions',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'connected' // This will only be true if DB is connected
  });
});

// Start server only after MongoDB connection is established
const startServer = async () => {
  try {
    // Connect to database FIRST
    console.log('🚀 Starting Stash Finance API...');
    await connectDB();
    
    // Start transaction scheduler AFTER DB connection
    console.log('⏰ Starting transaction scheduler...');
    transactionScheduler.startScheduler();
    
    // Start server ONLY after DB connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`✅ All systems ready!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('⚠️  Server will not start without database connection');
    process.exit(1);
  }
};

// Start the application
startServer();
