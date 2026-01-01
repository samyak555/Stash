import mongoose from 'mongoose';

/**
 * MongoDB Connection Configuration
 * Reads connection string from process.env.MONGO_URI or process.env.MONGODB_URI
 * Supports both for backward compatibility
 */
const connectDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI for compatibility
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string not found. Please set MONGO_URI or MONGODB_URI environment variable.');
    }

    // Disable mongoose buffering - fail fast if not connected
    mongoose.set('bufferCommands', false);

    // Connection options optimized for production
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds - fail fast
      socketTimeoutMS: 45000, // 45 seconds - longer for slow networks
      maxPoolSize: 10, // Maximum connections in pool
      minPoolSize: 2, // Minimum connections to maintain
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
    };

    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Closing MongoDB connection...`);
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('⚠️  Authentication failed - check username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('⚠️  DNS resolution failed - check connection string format');
    } else if (error.message.includes('timeout')) {
      console.error('⚠️  Connection timeout - check network access and IP whitelist in MongoDB Atlas');
    }
    
    console.error('⚠️  Make sure MONGO_URI (or MONGODB_URI) is set correctly in environment variables');
    throw error; // Re-throw to let caller handle
  }
};

/**
 * Check if MongoDB is connected
 * @returns {boolean} True if connected, false otherwise
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

export default connectDB;

