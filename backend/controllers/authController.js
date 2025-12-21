import jwt from 'jsonwebtoken';
import fileDB from '../utils/fileDB.js';
import transactionScheduler from '../services/scheduler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const existingUser = fileDB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = fileDB.createUser({ name, email });
    const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET);
    
    res.status(201).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, googleAccessToken } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    let user = fileDB.findUserByEmail(email);
    
    // If user doesn't exist and Google token provided, create user
    if (!user && googleAccessToken) {
      user = fileDB.createUser({ 
        name: email.split('@')[0], 
        email,
        googleAuth: true 
      });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // If Google OAuth token provided, automatically set up email sync
    if (googleAccessToken && user.email.endsWith('@gmail.com')) {
      try {
        // Store Google access token for Gmail API access
        const emailConfig = {
          email: user.email,
          accessToken: googleAccessToken, // Store OAuth token instead of password
          host: 'imap.gmail.com',
          port: 993,
          enabled: true,
          lastSync: null,
          authType: 'oauth' // Mark as OAuth authentication
        };
        
        // Update user with email config
        fileDB.updateUser(user._id, { emailConfig });
        
        // Set up email sync with OAuth token
        await transactionScheduler.setupUserEmailOAuth(user._id, emailConfig);
        
        console.log(`✅ Auto-configured Gmail sync for user: ${user.email}`);
      } catch (error) {
        console.error('Failed to auto-configure email sync:', error);
        // Don't fail login if email setup fails
      }
    }
    
    const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET);
    
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailAutoConnected: !!googleAccessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { accessToken, email, name } = req.body;
    
    if (!accessToken || !email) {
      return res.status(400).json({ message: 'Google access token and email are required' });
    }
    
    let user = fileDB.findUserByEmail(email);
    
    // Create user if doesn't exist
    if (!user) {
      user = fileDB.createUser({ 
        name: name || email.split('@')[0], 
        email,
        googleAuth: true 
      });
    } else {
      // Update existing user
      fileDB.updateUser(user._id, { googleAuth: true });
    }
    
    // Automatically set up Gmail sync for Gmail users
    if (email.endsWith('@gmail.com')) {
      try {
        const emailConfig = {
          email: user.email,
          accessToken: accessToken,
          host: 'imap.gmail.com',
          port: 993,
          enabled: true,
          lastSync: null,
          authType: 'oauth'
        };
        
        fileDB.updateUser(user._id, { emailConfig });
        await transactionScheduler.setupUserEmailOAuth(user._id, emailConfig);
        
        console.log(`✅ Auto-configured Gmail sync for Google user: ${user.email}`);
      } catch (error) {
        console.error('Failed to auto-configure email sync:', error);
      }
    }
    
    const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET);
    
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailAutoConnected: email.endsWith('@gmail.com'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
