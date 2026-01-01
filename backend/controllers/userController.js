import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
