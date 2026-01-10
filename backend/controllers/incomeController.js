import Income from '../models/Income.js';

export const getAll = async (req, res) => {
  try {
    // Guest mode - return empty array
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }
    const incomes = await Income.find({ user: req.userId }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const income = await Income.create({
      user: req.userId,
      amount: req.body.amount,
      source: req.body.source || 'Salary',
      date: req.body.date || new Date(),
      note: req.body.note || '',
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        amount: req.body.amount,
        source: req.body.source,
        date: req.body.date,
        note: req.body.note,
      },
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ message: error.message });
  }
};


