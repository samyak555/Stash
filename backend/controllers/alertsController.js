import {
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  checkPriceMovementAlerts,
  checkBudgetAlerts,
} from '../services/alertsService.js';
import Alert from '../models/Alert.js';

/**
 * Get all alerts for authenticated user
 */
export const getAlerts = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { unreadOnly, limit } = req.query;
    const alerts = await getUserAlerts(req.userId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 50,
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

/**
 * Create a new alert
 */
export const createAlert = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const alert = new Alert({
      ...req.body,
      userId: req.userId,
    });
    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Failed to create alert' });
  }
};

/**
 * Mark alert as read
 */
export const markRead = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const alert = await markAlertAsRead(req.userId, req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ message: 'Failed to mark alert as read' });
  }
};

/**
 * Mark all alerts as read
 */
export const markAllRead = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await markAllAlertsAsRead(req.userId);
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    res.status(500).json({ message: 'Failed to mark all alerts as read' });
  }
};

/**
 * Delete alert
 */
export const removeAlert = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const alert = await deleteAlert(req.userId, req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Failed to delete alert' });
  }
};

/**
 * Check and trigger alerts (called periodically)
 */
export const checkAlerts = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [priceAlerts, budgetAlerts] = await Promise.all([
      checkPriceMovementAlerts(req.userId),
      checkBudgetAlerts(req.userId),
    ]);

    res.json({
      triggered: priceAlerts.length + budgetAlerts.length,
      priceAlerts: priceAlerts.length,
      budgetAlerts: budgetAlerts.length,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    res.status(500).json({ message: 'Failed to check alerts' });
  }
};

