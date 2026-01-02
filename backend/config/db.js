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

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout (increased for Render)
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    isConnected = true;
    console.log('MongoDB connected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    isConnected = false;
    throw error;
  }
};

export default connectDB;

