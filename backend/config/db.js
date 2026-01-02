import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI environment variable is not set');
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }

  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    // Disable mongoose buffering to prevent slow requests
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);

    console.log('   Attempting MongoDB connection...');
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased for Render free tier)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    isConnected = true;
    console.log('   ✅ MongoDB connected successfully');
    console.log(`   Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('   ⚠️  MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('   ⚠️  MongoDB disconnected');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error('   ❌ MongoDB connection failed');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    if (error.message.includes('authentication')) {
      console.error('   💡 Check your MongoDB username and password');
    } else if (error.message.includes('timeout')) {
      console.error('   💡 Connection timeout - check your network or MongoDB Atlas IP whitelist');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('   💡 DNS resolution failed - check your MONGODB_URI connection string');
    }
    isConnected = false;
    throw error;
  }
};

export default connectDB;

