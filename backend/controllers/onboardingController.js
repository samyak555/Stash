/**
 * Onboarding Controller
 * Handles profile completion for new Google users
 * Only accessible for users with onboardingCompleted = false
 */

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Complete onboarding for new user
 * POST /api/onboarding
 * - Requires authentication
 * - Only works if onboardingCompleted = false
 * - Updates: name, age, profession
 * - Sets: onboardingCompleted = true
 */
export const completeOnboarding = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, age, profession } = req.body;

    // Validate required fields
    if (!name || !age || !profession) {
      return res.status(400).json({ message: 'Name, age, and profession are required' });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      return res.status(400).json({ message: 'Age must be between 13 and 100' });
    }

    // Validate profession
    const validProfessions = ['Student', 'Salaried', 'Business', 'Freelancer', 'Homemaker', 'Retired', 'Other'];
    if (!validProfessions.includes(profession) && profession !== 'Other') {
      return res.status(400).json({ message: 'Invalid profession' });
    }

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reject if onboarding already completed
    if (user.onboardingCompleted === true) {
      return res.status(400).json({ message: 'Onboarding already completed' });
    }

    // Update user profile
    user.name = name.trim();
    user.age = ageNum;
    user.profession = profession;
    user.onboardingCompleted = true;

    await user.save();

    console.log(`✅ Onboarding completed for user: ${user.email}`);

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        profession: user.profession,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
};

