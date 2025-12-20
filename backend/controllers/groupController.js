import fileDB from '../utils/fileDB.js';

export const getAll = async (req, res) => {
  try {
    const groups = fileDB.findGroups({ user: req.user._id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const group = fileDB.createGroup({
      ...req.body,
      owner: req.user._id,
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

