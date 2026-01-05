import fileDB from '../utils/fileDB.js';

export const getAll = async (req, res) => {
  try {
    // Guest mode - return empty array
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }
    const expenses = fileDB.findExpenses({ user: req.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    // Also create through auto-tracking pipeline
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
      // Continue with fileDB even if pipeline fails
    }
    
    // Create in fileDB (existing behavior)
    const expense = fileDB.createExpense({
      ...req.body,
      user: req.userId,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const expense = fileDB.updateExpense(req.params.id, req.body);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    fileDB.deleteExpense(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


