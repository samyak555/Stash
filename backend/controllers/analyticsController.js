import { calculateFinancialHealthScore } from '../services/financialHealthService.js';
import { getExpenseAnalytics } from '../services/expenseAnalyticsService.js';
import { getBudgetAnalytics } from '../services/budgetAnalyticsService.js';

/**
 * Get Financial Health Score
 */
export const getFinancialHealth = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const health = await calculateFinancialHealthScore(req.userId);
    res.json(health);
  } catch (error) {
    console.error('Error fetching financial health:', error);
    res.status(500).json({ message: 'Failed to calculate financial health' });
  }
};

/**
 * Get Expense Analytics
 */
export const getExpenseAnalyticsData = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { timeRange = 'month' } = req.query;
    const analytics = await getExpenseAnalytics(req.userId, timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching expense analytics:', error);
    res.status(500).json({ message: 'Failed to fetch expense analytics' });
  }
};

/**
 * Get Budget Analytics
 */
export const getBudgetAnalyticsData = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const analytics = await getBudgetAnalytics(req.userId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ message: 'Failed to fetch budget analytics' });
  }
};

