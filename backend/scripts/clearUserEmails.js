// Script to delete all users from database
// Usage: 
//   MONGODB_URI="your-connection-string" node backend/scripts/clearUserEmails.js
//   OR set MONGODB_URI in .env file in backend/ or root directory

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from multiple possible locations
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config(); // Also try default .env location

const clearUserEmails = async () => {
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

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('ℹ️  No users to clear');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all users (email is required field, so we delete instead of clearing)
    const result = await User.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} users from database`);
    console.log('✅ Database cleared successfully');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
clearUserEmails();

