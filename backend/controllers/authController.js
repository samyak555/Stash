import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
};

export const register = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const {
      name,
      email,
      password,
      confirmPassword,
      gender,
      age,
      profession,
      incomeSources,
      incomeRange,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Validate age
    if (age !== undefined && (age < 13 || age > 100)) {
      return res.status(400).json({ message: 'Age must be between 13 and 100' });
    }

    // Validate profession
    const validProfessions = [
      'Student',
      'Salaried (Private)',
      'Salaried (Government)',
      'Business Owner',
      'Freelancer',
      'Self Employed',
      'Homemaker',
      'Retired',
      'Unemployed',
      'Other',
    ];
    if (profession && !validProfessions.includes(profession)) {
      return res.status(400).json({ message: 'Invalid profession' });
    }

    // Validate income sources
    const validIncomeSources = [
      'Salary',
      'Business',
      'Freelancing',
      'Investments',
      'Rental Income',
      'Pension',
      'Scholarship',
      'Other',
    ];
    if (incomeSources && Array.isArray(incomeSources)) {
      const invalidSources = incomeSources.filter((source) => !validIncomeSources.includes(source));
      if (invalidSources.length > 0) {
        return res.status(400).json({ message: 'Invalid income source' });
      }
    }

    // Validate income range
    const validIncomeRanges = [
      'Below ₹10,000',
      '₹10,000 – ₹25,000',
      '₹25,000 – ₹50,000',
      '₹50,000 – ₹1,00,000',
      '₹1,00,000 – ₹5,00,000',
      'Above ₹5,00,000',
    ];
    if (incomeRange && !validIncomeRanges.includes(incomeRange)) {
      return res.status(400).json({ message: 'Invalid income range' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password with salt rounds 12 (production-ready)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gender,
      age,
      profession,
      incomeSources: Array.isArray(incomeSources) ? incomeSources : [],
      incomeRange,
    });

    // Generate JWT token with userId (7 days expiry)
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (exclude password)
    const userResponse = {
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      profession: user.profession,
      incomeSources: user.incomeSources,
      incomeRange: user.incomeRange,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Don't expose stack traces in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Registration error:', error.message);
      res.status(500).json({ message: 'Registration failed' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
};

export const login = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token with userId (7 days expiry)
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
};


