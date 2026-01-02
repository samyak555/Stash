import fileDB from '../utils/fileDB.js';

export const getAll = async (req, res) => {
  try {
    const budgets = fileDB.findBudgets({ user: req.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const budget = fileDB.createBudget({
      ...req.body,
      user: req.userId,
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


