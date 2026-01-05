import Alert from '../models/Alert.js';
import Holding from '../models/Holding.js';
import { getCryptoPrice, getMetalPrice } from './MarketPriceEngine.js';
import { calculateNetWorth } from './netWorthService.js';
import fileDB from '../utils/fileDB.js';

/**
 * Check and trigger price movement alerts
 */
export const checkPriceMovementAlerts = async (userId) => {
  try {
    const alerts = await Alert.find({
      userId,
      type: 'price_movement',
      isActive: true,
    }).lean();

    if (alerts.length === 0) return [];

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const { symbol, threshold, direction } = alert.config || {};
      if (!symbol || !threshold) continue;

      try {
        // Determine asset type from symbol or alert config
        const holding = await Holding.findOne({ userId, symbol }).lean();
        if (!holding) continue;

        let currentPrice = 0;
        let changePercent = 0;

        if (holding.assetType === 'crypto') {
          const priceData = await getCryptoPrice(symbol);
          if (priceData && !priceData.unavailable) {
            currentPrice = priceData.price;
            changePercent = priceData.changePercent || 0;
          }
        } else if (holding.assetType === 'gold' || holding.assetType === 'silver') {
          const priceData = await getMetalPrice(holding.assetType);
          if (priceData && !priceData.unavailable) {
            currentPrice = priceData.price;
            // For metals, we'd need to calculate change from previous price
            // For now, skip change calculation
          }
        }

        // Check if threshold is met
        const shouldTrigger = direction === 'up'
          ? changePercent >= threshold
          : direction === 'down'
          ? changePercent <= -threshold
          : Math.abs(changePercent) >= threshold;

        if (shouldTrigger && !alert.triggeredAt) {
          // Create triggered alert
          const triggeredAlert = new Alert({
            userId,
            type: 'price_movement',
            title: `${symbol} Price Alert`,
            description: `${symbol} has moved ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (threshold: ${threshold}%)`,
            config: alert.config,
            isActive: true,
            isRead: false,
            triggeredAt: new Date(),
          });
          await triggeredAlert.save();
          triggeredAlerts.push(triggeredAlert);
        }
      } catch (error) {
        console.warn(`Error checking price alert for ${symbol}:`, error.message);
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Error checking price movement alerts:', error);
    return [];
  }
};

/**
 * Check budget exceeded alerts
 */
export const checkBudgetAlerts = async (userId) => {
  try {
    const budgets = fileDB.findBudgets({ user: userId });
    const expenses = fileDB.findExpenses({ user: userId });

    const triggeredAlerts = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (const budget of budgets) {
      const budgetDate = new Date(budget.month || budget.createdAt);
      if (budgetDate.getMonth() !== currentMonth || budgetDate.getFullYear() !== currentYear) {
        continue; // Only check current month budgets
      }

      const monthlyExpenses = expenses
        .filter(e => {
          const expenseDate = new Date(e.date || e.createdAt);
          return expenseDate.getMonth() === currentMonth &&
                 expenseDate.getFullYear() === currentYear &&
                 e.category === budget.category;
        })
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const budgetAmount = parseFloat(budget.amount) || 0;
      const usagePercent = budgetAmount > 0 ? (monthlyExpenses / budgetAmount) * 100 : 0;

      if (usagePercent >= 90) {
        // Check if alert already exists
        const existingAlert = await Alert.findOne({
          userId,
          type: 'budget_exceeded',
          'config.budgetId': budget._id,
          triggeredAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24 hours
        });

        if (!existingAlert) {
          const alert = new Alert({
            userId,
            type: 'budget_exceeded',
            title: `Budget Alert: ${budget.category}`,
            description: `You've used ${usagePercent.toFixed(1)}% of your ${budget.category} budget (₹${monthlyExpenses.toFixed(2)} / ₹${budgetAmount.toFixed(2)})`,
            config: { budgetId: budget._id, threshold: usagePercent },
            isActive: true,
            isRead: false,
            triggeredAt: new Date(),
          });
          await alert.save();
          triggeredAlerts.push(alert);
        }
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    return [];
  }
};

/**
 * Get all alerts for a user
 */
export const getUserAlerts = async (userId, options = {}) => {
  try {
    const { unreadOnly = false, limit = 50 } = options;
    
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return alerts;
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return [];
  }
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (userId, alertId) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { isRead: true },
      { new: true }
    );
    return alert;
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return null;
  }
};

/**
 * Mark all alerts as read
 */
export const markAllAlertsAsRead = async (userId) => {
  try {
    await Alert.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return true;
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    return false;
  }
};

/**
 * Delete alert
 */
export const deleteAlert = async (userId, alertId) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: alertId, userId });
    return alert;
  } catch (error) {
    console.error('Error deleting alert:', error);
    return null;
  }
};

