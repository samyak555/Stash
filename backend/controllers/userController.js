import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { monthlyIncome } = req.body;
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
    if (monthlyIncome !== undefined) {
      updateData.monthlyIncome = monthlyIncome === null || monthlyIncome === '' ? null : parseFloat(monthlyIncome);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

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
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};


