import Goal from '../models/Goal.js';

export const getAll = async (req, res) => {
  try {
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const goal = await Goal.create({
      userId: req.userId,
      name: req.body.name,
      targetAmount: req.body.targetAmount,
      currentAmount: req.body.currentAmount || 0,
      deadline: req.body.deadline,
      status: req.body.status || 'active',
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const addProgress = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount = (goal.currentAmount || 0) + parseFloat(amount);

    // Auto complete if reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Add progress error:', error);
    res.status(500).json({ message: error.message });
  }
};



