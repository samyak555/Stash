import fileDB from '../utils/fileDB.js';

export const getAll = async (req, res) => {
  try {
    const goals = fileDB.findGoals({ user: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const goal = fileDB.createGoal({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const goal = fileDB.updateGoal(req.params.id, req.body);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

