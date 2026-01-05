import { calculateNetWorth } from '../services/netWorthService.js';
import CashBalance from '../models/CashBalance.js';
import Liability from '../models/Liability.js';

/**
 * Get net worth for authenticated user
 */
export const getNetWorth = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const netWorth = await calculateNetWorth(req.userId);
    res.json(netWorth);
  } catch (error) {
    console.error('Error fetching net worth:', error);
    res.status(500).json({ message: 'Failed to calculate net worth' });
  }
};

/**
 * Add cash balance
 */
export const addCashBalance = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cashBalance = new CashBalance({
      ...req.body,
      userId: req.userId,
    });
    await cashBalance.save();
    res.json(cashBalance);
  } catch (error) {
    console.error('Error adding cash balance:', error);
    res.status(500).json({ message: 'Failed to add cash balance' });
  }
};

/**
 * Update cash balance
 */
export const updateCashBalance = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cashBalance = await CashBalance.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!cashBalance) {
      return res.status(404).json({ message: 'Cash balance not found' });
    }

    Object.assign(cashBalance, req.body);
    await cashBalance.save();
    res.json(cashBalance);
  } catch (error) {
    console.error('Error updating cash balance:', error);
    res.status(500).json({ message: 'Failed to update cash balance' });
  }
};

/**
 * Delete cash balance
 */
export const deleteCashBalance = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cashBalance = await CashBalance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!cashBalance) {
      return res.status(404).json({ message: 'Cash balance not found' });
    }

    res.json({ message: 'Cash balance deleted' });
  } catch (error) {
    console.error('Error deleting cash balance:', error);
    res.status(500).json({ message: 'Failed to delete cash balance' });
  }
};

/**
 * Add liability
 */
export const addLiability = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const liability = new Liability({
      ...req.body,
      userId: req.userId,
    });
    await liability.save();
    res.json(liability);
  } catch (error) {
    console.error('Error adding liability:', error);
    res.status(500).json({ message: 'Failed to add liability' });
  }
};

/**
 * Update liability
 */
export const updateLiability = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const liability = await Liability.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!liability) {
      return res.status(404).json({ message: 'Liability not found' });
    }

    Object.assign(liability, req.body);
    await liability.save();
    res.json(liability);
  } catch (error) {
    console.error('Error updating liability:', error);
    res.status(500).json({ message: 'Failed to update liability' });
  }
};

/**
 * Delete liability
 */
export const deleteLiability = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const liability = await Liability.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!liability) {
      return res.status(404).json({ message: 'Liability not found' });
    }

    res.json({ message: 'Liability deleted' });
  } catch (error) {
    console.error('Error deleting liability:', error);
    res.status(500).json({ message: 'Failed to delete liability' });
  }
};

