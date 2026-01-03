import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate userId exists
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId).select('-passwordHash -verificationToken -resetTokenHash');

    if (!user) {
      console.warn(`Profile not found for userId: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure boolean fields are always boolean (defensive)
    const profileData = {
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      emailVerified: user.emailVerified === true,
      gender: user.gender || null,
      age: user.age || null,
      profession: user.profession || null,
      monthlyIncome: user.monthlyIncome || null,
      onboardingCompleted: user.onboardingCompleted === true,
      expensesCompleted: user.expensesCompleted === true,
      goalsCompleted: user.goalsCompleted === true,
      role: user.role || 'user',
      authProvider: user.authProvider || 'local',
    };

    res.json(profileData);
  } catch (error) {
    console.error('Get profile error:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: error.message || 'Failed to get profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { monthlyIncome, onboardingCompleted, expensesCompleted, goalsCompleted, name, age, profession } = req.body;
    const userId = req.userId;

    // Validate userId exists
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate monthlyIncome if provided
    if (monthlyIncome !== null && monthlyIncome !== undefined) {
      const incomeNum = parseFloat(monthlyIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        return res.status(400).json({ message: 'Invalid monthly income. Must be a non-negative number.' });
      }
    }

    // Update user profile
    const updateData = {};
    if (name !== undefined) {
      const trimmedName = name.trim();
      // Validate name - must not be empty and reasonable length
      if (trimmedName.length === 0) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (trimmedName.length > 100) {
        return res.status(400).json({ message: 'Name must be 100 characters or less' });
      }
      updateData.name = trimmedName;
    }
    if (age !== undefined) {
      // Handle empty string or null
      if (age === '' || age === null) {
        updateData.age = null;
      } else {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
          return res.status(400).json({ message: 'Invalid age. Must be between 13 and 100.' });
        }
        updateData.age = ageNum;
      }
    }
    if (profession !== undefined) {
      // Handle empty string - allow clearing profession
      if (profession === '' || profession === null) {
        updateData.profession = null;
      } else {
        const validProfessions = ['Student', 'Salaried', 'Business', 'Freelancer', 'Homemaker', 'Retired', 'Other'];
        const trimmedProfession = profession.trim();
        if (!validProfessions.includes(trimmedProfession)) {
          return res.status(400).json({ message: 'Invalid profession. Must be one of: ' + validProfessions.join(', ') });
        }
        updateData.profession = trimmedProfession;
      }
    }
    if (monthlyIncome !== undefined) {
      updateData.monthlyIncome = monthlyIncome === null || monthlyIncome === '' ? null : parseFloat(monthlyIncome);
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted === true || onboardingCompleted === 'true';
    }
    if (expensesCompleted !== undefined) {
      updateData.expensesCompleted = expensesCompleted === true || expensesCompleted === 'true';
    }
    if (goalsCompleted !== undefined) {
      updateData.goalsCompleted = goalsCompleted === true || goalsCompleted === 'true';
    }

    // Check if user exists before updating
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash -verificationToken -resetTokenHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    console.log(`✅ Profile updated for user: ${user.email} (${userId})`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      profession: user.profession,
      monthlyIncome: user.monthlyIncome,
      onboardingCompleted: user.onboardingCompleted,
      expensesCompleted: user.expensesCompleted || false,
      goalsCompleted: user.goalsCompleted || false,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${validationErrors}` });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A user with this information already exists' });
    }
    
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

/**
 * Delete user account and all associated data
 * DELETE /api/users/account
 * Requires authenticated user (JWT token)
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // Verify user exists and is authenticated
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow deletion for Google-authenticated users
    if (user.authProvider !== 'google') {
      return res.status(403).json({ message: 'Account deletion is only available for Google-authenticated users' });
    }

    // Delete all user-related data from MongoDB
    // Delete transactions
    await Transaction.deleteMany({ userId: userId });
    
    // Delete goals
    await Goal.deleteMany({ userId: userId });

    // Also delete from fileDB (for backward compatibility during migration)
    try {
      const fileDB = (await import('../utils/fileDB.js')).default;
      
      // Delete expenses
      const expenses = fileDB.findExpenses({ user: userId });
      expenses.forEach(expense => {
        fileDB.deleteExpense(expense._id);
      });

      // Delete income
      const incomes = fileDB.findIncomes({ user: userId });
      incomes.forEach(income => {
        fileDB.deleteIncome(income._id);
      });

      // Delete goals (fileDB)
      const goals = fileDB.findGoals({ user: userId });
      goals.forEach(goal => {
        fileDB.deleteGoal(goal._id);
      });

      // Delete budgets
      const budgets = fileDB.findBudgets({ user: userId });
      if (fileDB.deleteBudget) {
        budgets.forEach(budget => {
          fileDB.deleteBudget(budget._id);
        });
      }
    } catch (fileDBError) {
      // FileDB deletion is optional - log but don't fail
      console.warn('FileDB cleanup warning:', fileDBError.message);
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    console.log(`✅ Account deleted: ${user.email} (${userId})`);

    res.json({ 
      message: 'Account and all associated data have been permanently deleted' 
    });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};


