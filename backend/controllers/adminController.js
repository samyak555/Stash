import User from '../models/User.js';

/**
 * Clear all users from database (Admin only)
 * WARNING: This is irreversible!
 */
export const clearAllUsers = async (req, res) => {
  try {
    // Count users before deletion
    const userCount = await User.countDocuments({});
    
    if (userCount === 0) {
      return res.json({ 
        message: 'Database is already empty',
        deletedCount: 0 
      });
    }

    // Delete all users
    const result = await User.deleteMany({});

    console.log(`✅ Admin cleared database: Deleted ${result.deletedCount} users`);

    res.json({ 
      message: `Successfully deleted ${result.deletedCount} users from database`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing database:', error.message);
    res.status(500).json({ message: 'Failed to clear database' });
  }
};

/**
 * Get database statistics (Admin only)
 */
export const getDatabaseStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers: userCount,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
    });
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    res.status(500).json({ message: 'Failed to get database statistics' });
  }
};

