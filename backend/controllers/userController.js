import fileDB from '../utils/fileDB.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = fileDB.findAllUsers();
    res.json(users.map(u => ({ _id: u._id, name: u.name, email: u.email })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

