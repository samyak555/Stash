import Budget from '../models/Budget.js';

export const getAll = async (req, res) => {
  try {
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }
    const budgets = await Budget.find({ user: req.userId });
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { category, limit, period, alertThreshold } = req.body;

    // Check if budget for category exists
    const existingBudget = await Budget.findOne({ user: req.userId, category });
    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category already exists' });
    }

    const budget = await Budget.create({
      user: req.userId,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: error.message });
  }
};



