   import fileDB from '../utils/fileDB.js';

const connectDB = async () => {
  try {
    await fileDB.initDB();
    console.log(`✅ File-based Database Initialized: ${fileDB.getDbFilePath()}`);
  } catch (error) {
    console.error('❌ File-based Database initialization error:', error.message);
    console.error('⚠️  Server will continue but database operations might fail.');
  }
};

export default connectDB;


