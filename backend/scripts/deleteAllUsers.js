// Script to delete all users from database
// Usage: node backend/scripts/deleteAllUsers.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const deleteAllUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Count users before deletion
    const userCount = await User.countDocuments({});
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('ℹ️  No users to delete');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all users
    const result = await User.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} users from database`);
    console.log('✅ Database cleared successfully');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting users:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
deleteAllUsers();

