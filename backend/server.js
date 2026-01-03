// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import http from 'http';
import https from 'https';
import connectDB from './config/db.js';
import { verifyEmailService } from './services/emailService.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import testRoutes from './routes/testRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.onrender.com", "https://*.vercel.app", "http://localhost:*", "ws://localhost:*", "wss://localhost:*"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS middleware - Allow frontend origin and OAuth redirects
const allowedOrigins = [
  'https://stash-beige.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, OAuth redirects, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, allow OAuth redirects (no origin) but be strict about others
      if (process.env.NODE_ENV === 'production') {
        // Allow if it's a known pattern (Render, Vercel, etc.)
        if (origin.includes('onrender.com') || origin.includes('vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(null, true); // Allow in development
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-mode'],
}));

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Guest mode middleware - check X-Guest-Mode header
app.use((req, res, next) => {
  if (req.headers['x-guest-mode'] === 'true') {
    req.isGuest = true;
    req.userId = null;
  }
  next();
});

// ============================================
// HEALTH CHECKS (Lightweight - for Render keep-alive)
// ============================================
// Root-level health check (ultra-fast, no DB check - for Render pings)
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Stash Backend API',
    timestamp: new Date().toISOString()
  });
});

// Lightweight ping endpoint (for keep-alive service)
app.get('/ping', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Full health check with DB status
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes - Auth routes FIRST (important for OAuth)
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware - Production-ready (no stack traces)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  // Don't expose stack traces to client in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }) // Only show stack in development
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
    console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'set' : '❌ NOT SET'}`);
    console.log(`   BACKEND_URL: ${process.env.BACKEND_URL || 'not set'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
    
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
    
    // Verify Gmail SMTP connection (truly async, non-blocking)
    // Don't await - let it run in background to speed up startup
    console.log('📧 Verifying Gmail SMTP connection (async)...');
    verifyEmailService()
      .then((emailResult) => {
        if (!emailResult.success) {
          console.warn('⚠️  Email service not configured or verification failed');
          console.warn('   Server will start but emails will not be sent');
          console.warn('   Details:', emailResult.error || 'Unknown error');
          if (emailResult.details) {
            console.warn('   Configuration:', emailResult.details);
          }
        } else {
          console.log('✅ Email service verified successfully');
        }
      })
      .catch((emailError) => {
        // Log error but don't crash server
        console.warn('⚠️  Email service verification failed:', emailError.message);
        console.warn('   Server will start but emails may not work');
        console.warn('   Check EMAIL_USER and EMAIL_PASS environment variables');
      });
    
    console.log(`🚀 Starting server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`✅ Server running successfully on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth routes available at: http://localhost:${PORT}/api/auth/*`);
      console.log(`   - GET /api/auth/google`);
      console.log(`   - GET /api/auth/google/callback`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - POST /api/auth/login`);
      
      // Start keep-alive service to prevent cold starts
      startKeepAliveService();
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

// ============================================
// KEEP-ALIVE SERVICE (Prevents Render cold starts)
// ============================================
/**
 * Keep-alive service that pings the server every 10-14 minutes
 * This prevents Render free tier from putting the service to sleep
 */
const startKeepAliveService = () => {
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const url = new URL(BACKEND_URL);
  const hostname = url.hostname;
  const port = url.port || (url.protocol === 'https:' ? 443 : 80);
  const path = '/ping';
  const protocol = url.protocol === 'https:' ? https : http;
  
  // Ping every 10 minutes (Render free tier sleeps after ~15 min of inactivity)
  const keepAliveJob = schedule.scheduleJob('*/10 * * * *', () => {
    const options = {
      hostname: hostname === 'localhost' ? 'localhost' : hostname,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'Stash-KeepAlive/1.0'
      }
    };
    
    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`💓 Keep-alive ping successful at ${new Date().toLocaleTimeString()}`);
      } else {
        console.warn(`⚠️  Keep-alive ping returned status ${res.statusCode}`);
      }
      res.on('data', () => {}); // Consume response
      res.on('end', () => {});
    });
    
    req.on('error', (error) => {
      // Don't log errors in production to avoid noise
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️  Keep-alive ping failed: ${error.message}`);
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Keep-alive ping timeout');
      }
    });
    
    req.end();
  });
  
  if (keepAliveJob) {
    console.log('💓 Keep-alive service started (pings every 10 minutes)');
  } else {
    console.warn('⚠️  Failed to start keep-alive service');
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
