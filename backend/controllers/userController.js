import User from '../models/User.js';

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

    const user = await User.findById(userId).select('-passwordHash -verificationToken -resetTokenHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      gender: user.gender,
      age: user.age,
      profession: user.profession,
      monthlyIncome: user.monthlyIncome,
      onboardingCompleted: user.onboardingCompleted,
      expensesCompleted: user.expensesCompleted || false,
      goalsCompleted: user.goalsCompleted || false,
      role: user.role,
      authProvider: user.authProvider,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { monthlyIncome, onboardingCompleted, expensesCompleted, goalsCompleted, name, age, profession } = req.body;
    const userId = req.userId;

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
      updateData.name = name.trim();
    }
    if (age !== undefined) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
        return res.status(400).json({ message: 'Invalid age. Must be between 13 and 100.' });
      }
      updateData.age = ageNum;
    }
    if (profession !== undefined) {
      updateData.profession = profession.trim();
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

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash -verificationToken -resetTokenHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
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

    // Delete all user-related data from fileDB
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

    // Delete goals
    const goals = fileDB.findGoals({ user: userId });
    goals.forEach(goal => {
      fileDB.deleteGoal(goal._id);
    });

    // Delete budgets (if deleteBudget method exists)
    const budgets = fileDB.findBudgets({ user: userId });
    if (fileDB.deleteBudget) {
      budgets.forEach(budget => {
        fileDB.deleteBudget(budget._id);
      });
    } else {
      // If no deleteBudget method, filter out budgets
      const db = fileDB.readDB ? fileDB.readDB() : null;
      if (db && db.budgets) {
        db.budgets = db.budgets.filter(b => b.user !== userId);
        if (fileDB.writeDB) fileDB.writeDB(db);
      }
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


