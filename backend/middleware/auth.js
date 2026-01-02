import jwt from 'jsonwebtoken';

/**
 * Authenticate middleware - verifies JWT token
 * Works with guest mode - if no token, req.isGuest should be set by allowGuest middleware
 */
export const authenticate = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const authHeader = req.headers.authorization;
    
    // If no auth header and isGuest is set, allow to continue (guest mode)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (req.isGuest) {
        return next(); // Guest mode - allow read-only access
      }
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      if (req.isGuest) {
        return next(); // Guest mode
      }
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach userId to request object
      req.userId = decoded.userId;
      req.isGuest = false; // User is authenticated
      
      if (!req.userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      next();
    } catch (tokenError) {
      // Token verification failed - check if guest mode is allowed
      if (req.isGuest) {
        return next(); // Allow guest access
      }
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};


