import Holding from '../models/Holding.js';
import { calculatePortfolio, getPortfolioSummary } from '../services/portfolioService.js';

/**
 * Create a new holding
 */
export const createHolding = async (req, res) => {
  try {
    // Guest mode - return error
    if (req.isGuest || !req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { assetType, symbol, name, quantity, buyPrice, buyDate, broker } = req.body;

    // Validation
    if (!assetType || !symbol || !name || !quantity || !buyPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['stock', 'mf', 'crypto', 'gold', 'silver'].includes(assetType)) {
      return res.status(400).json({ message: 'Invalid asset type' });
    }

    if (quantity <= 0 || buyPrice <= 0) {
      return res.status(400).json({ message: 'Quantity and buy price must be greater than 0' });
    }

    const investedAmount = quantity * buyPrice;

    const holding = new Holding({
      userId: req.userId,
      assetType,
      symbol: symbol.toUpperCase(),
      name,
      quantity,
      buyPrice,
      buyDate: buyDate ? new Date(buyDate) : new Date(),
      broker: broker || '',
      investedAmount,
    });

    await holding.save();

    res.status(201).json(holding);
  } catch (error) {
    console.error('Error creating holding:', error);
    res.status(500).json({ message: error.message || 'Failed to create holding' });
  }
};

/**
 * Get all holdings for a user
 */
export const getHoldings = async (req, res) => {
  try {
    // Guest mode - return empty array
    if (req.isGuest || !req.userId) {
      return res.json([]);
    }

    const holdings = await Holding.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch holdings' });
  }
};

/**
 * Get portfolio with live prices and calculations
 */
export const getPortfolio = async (req, res) => {
  try {
    // Guest mode - return empty portfolio
    if (req.isGuest || !req.userId) {
      return res.json({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        holdings: [],
        assetAllocation: {},
        bestPerformer: null,
        worstPerformer: null,
      });
    }

    const portfolio = await calculatePortfolio(req.userId);
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch portfolio' });
  }
};

/**
 * Get portfolio summary (for dashboard)
 */
export const getPortfolioSummaryController = async (req, res) => {
  try {
    // Guest mode - return empty summary
    if (req.isGuest || !req.userId) {
      return res.json({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        bestPerformer: null,
        holdingCount: 0,
      });
    }

    const summary = await getPortfolioSummary(req.userId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch portfolio summary' });
  }
};

/**
 * Update a holding
 */
export const updateHolding = async (req, res) => {
  try {
    // Guest mode - return error
    if (req.isGuest || !req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const { symbol, name, quantity, buyPrice, buyDate, broker } = req.body;

    const holding = await Holding.findOne({ _id: id, userId: req.userId });

    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    // Update fields
    if (symbol) holding.symbol = symbol.toUpperCase();
    if (name) holding.name = name;
    if (quantity !== undefined) {
      holding.quantity = quantity;
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
      }
    }
    if (buyPrice !== undefined) {
      holding.buyPrice = buyPrice;
      if (buyPrice <= 0) {
        return res.status(400).json({ message: 'Buy price must be greater than 0' });
      }
    }
    if (buyDate) holding.buyDate = new Date(buyDate);
    if (broker !== undefined) holding.broker = broker;

    // Recalculate invested amount
    holding.investedAmount = holding.quantity * holding.buyPrice;

    await holding.save();

    res.json(holding);
  } catch (error) {
    console.error('Error updating holding:', error);
    res.status(500).json({ message: error.message || 'Failed to update holding' });
  }
};

/**
 * Delete a holding
 */
export const deleteHolding = async (req, res) => {
  try {
    // Guest mode - return error
    if (req.isGuest || !req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const holding = await Holding.findOneAndDelete({ _id: id, userId: req.userId });

    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({ message: error.message || 'Failed to delete holding' });
  }
};

