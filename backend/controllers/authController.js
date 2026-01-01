import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import transactionScheduler from '../services/scheduler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({ name, email: email.toLowerCase() });
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
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist and Google token provided, create user
    if (!user && googleAccessToken) {
      user = await User.create({ 
        name: email.split('@')[0], 
        email: email.toLowerCase(),
        googleAuth: true 
      });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // If Google OAuth token provided, automatically set up email sync
    if (googleAccessToken && user.email.endsWith('@gmail.com')) {
      try {
        const emailConfig = {
          email: user.email,
          accessToken: googleAccessToken,
          host: 'imap.gmail.com',
          port: 993,
          enabled: true,
          lastSync: null,
          authType: 'oauth'
        };
        
        user.emailConfig = emailConfig;
        await user.save();
        await transactionScheduler.setupUserEmailOAuth(user._id.toString(), emailConfig);
        
        console.log(`✅ Auto-configured Gmail sync for user: ${user.email}`);
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
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = await User.create({ 
        name: name || email.split('@')[0], 
        email: email.toLowerCase(),
        googleAuth: true 
      });
    } else {
      user.googleAuth = true;
      await user.save();
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
        
        user.emailConfig = emailConfig;
        await user.save();
        await transactionScheduler.setupUserEmailOAuth(user._id.toString(), emailConfig);
        
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
