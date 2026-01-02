/**
 * Guest Mode Middleware
 * Allows read-only access for unauthenticated users
 * Blocks all write operations for guests
 */

export const allowGuest = (req, res, next) => {
  // Check if user is authenticated
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token - mark as guest
    req.isGuest = true;
    req.userId = null;
    return next();
  }
  
  // Token exists - will be verified by authenticate middleware
  req.isGuest = false;
  next();
};

/**
 * Require authentication (no guests allowed)
 * Use this for write operations
 */
export const requireAuth = (req, res, next) => {
  if (req.isGuest) {
    return res.status(401).json({ 
      message: 'Authentication required. Please sign in with Google to save your data.',
      requiresAuth: true 
    });
  }
  next();
};

/**
 * Optional auth - allows both guests and authenticated users
 * Use this for read operations
 */
export const optionalAuth = (req, res, next) => {
  // Guest mode is already set by allowGuest middleware
  // This just ensures the middleware chain continues
  next();
};

