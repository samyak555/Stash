/**
 * AUTO TRANSACTION CONTROLLER
 * 
 * Handles all transaction operations through the pipeline
 */

import AutoTransaction from '../models/AutoTransaction.js';
import { processTransaction } from '../services/transactionPipeline.js';

/**
 * Create transaction (goes through pipeline)
 */
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, date, merchant, description, note, accountType } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Build raw transaction data
    const rawTransaction = {
      amount: parseFloat(amount),
      type: type === 'expense' ? 'debit' : type === 'income' ? 'credit' : type,
      date: date || new Date(),
      merchant: merchant || '',
      description: description || '',
      note: note || '',
      accountType: accountType || 'bank',
    };
    
    // Process through pipeline
    const result = await processTransaction(rawTransaction, userId, 'manual');
    
    if (result.isDuplicate) {
      return res.status(409).json({
        message: 'Duplicate transaction detected',
        transaction: result.transaction,
      });
    }
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: error.message || 'Failed to create transaction' });
  }
};

/**
 * Get user transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, type, category, source, limit = 100, page = 1 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const query = { userId };
    
    // Date range filter
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }
    
    // Type filter
    if (type) {
      query.type = type;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Source filter
    if (source) {
      query.source = source;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await AutoTransaction.find(query)
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await AutoTransaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch transactions' });
  }
};

/**
 * Update transaction (user correction)
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { category, merchantNormalized } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const transaction = await AutoTransaction.findOne({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Store user corrections for learning
    if (category && category !== transaction.category) {
      transaction.userCorrectedCategory = category;
      transaction.category = category;
      transaction.categoryConfidence = 1.0; // User correction = 100% confidence
    }
    
    if (merchantNormalized && merchantNormalized !== transaction.merchantNormalized) {
      transaction.userCorrectedMerchant = merchantNormalized;
      transaction.merchantNormalized = merchantNormalized;
    }
    
    await transaction.save();
    
    res.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: error.message || 'Failed to update transaction' });
  }
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const transaction = await AutoTransaction.findOneAndDelete({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete transaction' });
  }
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const query = { userId };
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }
    
    const transactions = await AutoTransaction.find(query);
    
    const stats = {
      total: transactions.length,
      totalDebit: 0,
      totalCredit: 0,
      byCategory: {},
      bySource: {},
      byMonth: {},
    };
    
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        stats.totalDebit += tx.amount;
      } else {
        stats.totalCredit += tx.amount;
      }
      
      // Category breakdown
      const cat = tx.category || 'Others';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + tx.amount;
      
      // Source breakdown
      const src = tx.source || 'manual';
      stats.bySource[src] = (stats.bySource[src] || 0) + 1;
      
      // Monthly breakdown
      const month = tx.transactionDate.toISOString().substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + tx.amount;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch statistics' });
  }
};

