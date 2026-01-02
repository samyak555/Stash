import User from '../models/User.js';

/**
 * Admin middleware - Restrict access to admin-only routes
 * Must be used after authenticate middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // userId should be set by authenticate middleware
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find user and check role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach user to request for convenience
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ message: 'Authorization check failed' });
  }
};

