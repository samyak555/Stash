import Expense from '../models/Expense.js';

export const getAll = async (req, res) => {
  try {
    // Guest mode - return empty array
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Create in MongoDB
    const expense = await Expense.create({
      user: req.userId,
      amount: req.body.amount,
      category: req.body.category || 'Others',
      date: req.body.date || new Date(),
      note: req.body.note || '',
      description: req.body.description || '',
    });

    // Also create through auto-tracking pipeline (optional, non-blocking)
    try {
      const { processTransaction } = await import('../services/transactionPipeline.js');
      const rawTransaction = {
        amount: parseFloat(req.body.amount) || 0,
        type: 'debit',
        date: req.body.date || new Date(),
        merchant: req.body.merchant || '',
        description: req.body.description || req.body.category || '',
        note: req.body.note || '',
        accountType: 'bank',
      };

      // Process through pipeline (non-blocking)
      processTransaction(rawTransaction, req.userId, 'manual').catch(err => {
        console.error('Pipeline processing error:', err);
      });
    } catch (pipelineError) {
      console.error('Pipeline import error:', pipelineError);
      // Continue even if pipeline fails
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
        note: req.body.note,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: error.message });
  }
};



