import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stash';
    
    // Disable buffering - fail fast if not connected
    mongoose.set('bufferCommands', false);
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 5,
    };
    
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });
    
    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Make sure MONGODB_URI is set in your .env file');
    console.error('⚠️  Check network access/IP whitelist in MongoDB Atlas');
    throw error; // Re-throw to let caller handle
  }
};

export default connectDB;
