// Simple script to delete all users
// Usage: node backend/scripts/deleteUsers.js "your-mongodb-uri"

import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please provide MONGODB_URI as argument or environment variable');
  console.error('Usage: node backend/scripts/deleteUsers.js "mongodb+srv://..."');
  process.exit(1);
}

const deleteAllUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Count users
    const userCount = await User.countDocuments({});
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('ℹ️  No users to delete');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all users
    console.log('🗑️  Deleting all users...');
    const result = await User.deleteMany({});

    console.log(`✅ Successfully deleted ${result.deletedCount} users`);
    console.log('✅ Database cleared!');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

deleteAllUsers();

