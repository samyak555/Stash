/**
 * RECURRING TRANSACTION DETECTION SERVICE
 * 
 * Detects recurring transactions by analyzing patterns:
 * - Same merchant
 * - Similar amount (±2-5%)
 * - Regular interval (monthly/weekly)
 */

import AutoTransaction from '../models/AutoTransaction.js';
import RecurringGroup from '../models/RecurringGroup.js';

/**
 * Detect if transaction is recurring and assign to group
 */
export const detectRecurring = async (transaction) => {
  try {
    if (!transaction.merchantNormalized || transaction.merchantNormalized.trim().length === 0) {
      return null; // Cannot detect recurring without merchant
    }
    
    // Find existing recurring group for this merchant
    let recurringGroup = await RecurringGroup.findOne({
      userId: transaction.userId,
      merchantNormalized: transaction.merchantNormalized,
      isActive: true,
    });
    
    if (recurringGroup) {
      // Check if transaction matches pattern
      const amountVariance = Math.abs(
        (transaction.amount - recurringGroup.averageAmount) / recurringGroup.averageAmount
      );
      
      // If amount is within variance threshold
      if (amountVariance <= 0.1) { // 10% variance allowed
        // Update group statistics
        recurringGroup.transactionCount += 1;
        recurringGroup.totalAmount += transaction.amount;
        recurringGroup.averageAmount = recurringGroup.totalAmount / recurringGroup.transactionCount;
        recurringGroup.lastTransactionDate = transaction.transactionDate;
        recurringGroup.nextExpectedDate = calculateNextExpectedDate(
          recurringGroup.lastTransactionDate,
          recurringGroup.interval
        );
        await recurringGroup.save();
        
        // Mark transaction as recurring
        transaction.isRecurring = true;
        transaction.recurringGroupId = recurringGroup._id;
        await transaction.save();
        
        return recurringGroup;
      }
    } else {
      // Check if this could be a new recurring transaction
      const similarTransactions = await AutoTransaction.find({
        userId: transaction.userId,
        merchantNormalized: transaction.merchantNormalized,
        transactionDate: {
          $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      }).sort({ transactionDate: 1 });
      
      if (similarTransactions.length >= 2) {
        // Check if amounts are similar
        const amounts = similarTransactions.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.every(amt => Math.abs(amt - avgAmount) / avgAmount <= 0.1);
        
        if (variance) {
          // Check interval pattern
          const intervals = calculateIntervals(similarTransactions.map(t => t.transactionDate));
          const mostCommonInterval = getMostCommonInterval(intervals);
          
          if (mostCommonInterval) {
            // Create new recurring group
            recurringGroup = new RecurringGroup({
              userId: transaction.userId,
              merchantNormalized: transaction.merchantNormalized,
              category: transaction.category,
              averageAmount: avgAmount,
              amountVariance: 0.1,
              interval: mostCommonInterval,
              lastTransactionDate: transaction.transactionDate,
              nextExpectedDate: calculateNextExpectedDate(transaction.transactionDate, mostCommonInterval),
              transactionCount: similarTransactions.length + 1,
              totalAmount: amounts.reduce((a, b) => a + b, 0) + transaction.amount,
              isActive: true,
            });
            
            await recurringGroup.save();
            
            // Mark all similar transactions as recurring
            await AutoTransaction.updateMany(
              {
                _id: { $in: similarTransactions.map(t => t._id) },
              },
              {
                $set: {
                  isRecurring: true,
                  recurringGroupId: recurringGroup._id,
                },
              }
            );
            
            // Mark current transaction
            transaction.isRecurring = true;
            transaction.recurringGroupId = recurringGroup._id;
            await transaction.save();
            
            return recurringGroup;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Recurring detection error:', error);
    return null;
  }
};

/**
 * Calculate intervals between transaction dates
 */
const calculateIntervals = (dates) => {
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    const diff = dates[i] - dates[i - 1];
    intervals.push(diff);
  }
  return intervals;
};

/**
 * Get most common interval pattern
 */
const getMostCommonInterval = (intervals) => {
  if (intervals.length === 0) return null;
  
  // Convert to days
  const days = intervals.map(ms => Math.round(ms / (24 * 60 * 60 * 1000)));
  
  // Find most common interval
  const avgDays = days.reduce((a, b) => a + b, 0) / days.length;
  
  // Map to interval type
  if (avgDays >= 25 && avgDays <= 35) return 'monthly';
  if (avgDays >= 6 && avgDays <= 8) return 'weekly';
  if (avgDays >= 12 && avgDays <= 16) return 'biweekly';
  if (avgDays >= 85 && avgDays <= 95) return 'quarterly';
  if (avgDays >= 360 && avgDays <= 370) return 'yearly';
  
  return null;
};

/**
 * Calculate next expected date
 */
const calculateNextExpectedDate = (lastDate, interval) => {
  const next = new Date(lastDate);
  
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  
  return next;
};

/**
 * Get user's recurring transactions
 */
export const getUserRecurringTransactions = async (userId) => {
  try {
    const groups = await RecurringGroup.find({
      userId,
      isActive: true,
    }).sort({ nextExpectedDate: 1 });
    
    return groups;
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return [];
  }
};

