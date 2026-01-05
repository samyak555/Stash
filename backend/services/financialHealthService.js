import fileDB from '../utils/fileDB.js';
import Goal from '../models/Goal.js';
import Holding from '../models/Holding.js';

/**
 * Calculate Financial Health Score (0-100)
 * Based on multiple factors:
 * - Savings Rate
 * - Expense Management
 * - Goal Progress
 * - Debt Ratio (if liabilities exist)
 * - Investment Diversification
 */
export const calculateFinancialHealthScore = async (userId) => {
  try {
    const expenses = fileDB.findExpenses({ user: userId });
    const incomes = fileDB.findIncomes({ user: userId });
    const budgets = fileDB.findBudgets({ user: userId });
    const goals = await Goal.find({ userId, status: 'active' }).lean();
    const holdings = await Holding.find({ userId }).lean();

    // 1. Savings Rate Score (0-30 points)
    const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    let savingsScore = 0;
    if (savingsRate >= 20) savingsScore = 30;
    else if (savingsRate >= 15) savingsScore = 25;
    else if (savingsRate >= 10) savingsScore = 20;
    else if (savingsRate >= 5) savingsScore = 15;
    else if (savingsRate > 0) savingsScore = 10;
    else if (savingsRate === 0) savingsScore = 5;

    // 2. Expense Management Score (0-25 points)
    let expenseScore = 25;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    budgets.forEach(budget => {
      const budgetDate = new Date(budget.month || budget.createdAt);
      if (budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear) {
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
        
        if (usagePercent > 100) expenseScore -= 5;
        else if (usagePercent > 90) expenseScore -= 3;
      }
    });
    expenseScore = Math.max(0, expenseScore);

    // 3. Goal Progress Score (0-20 points)
    let goalScore = 0;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, g) => {
        const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        return sum + progress;
      }, 0) / goals.length;
      
      if (avgProgress >= 75) goalScore = 20;
      else if (avgProgress >= 50) goalScore = 15;
      else if (avgProgress >= 25) goalScore = 10;
      else if (avgProgress > 0) goalScore = 5;
    } else {
      goalScore = 10; // Bonus for having goals
    }

    // 4. Investment Diversification Score (0-15 points)
    let investmentScore = 0;
    if (holdings.length > 0) {
      const assetTypes = new Set(holdings.map(h => h.assetType));
      if (assetTypes.size >= 4) investmentScore = 15;
      else if (assetTypes.size >= 3) investmentScore = 12;
      else if (assetTypes.size >= 2) investmentScore = 8;
      else investmentScore = 5;
    }

    // 5. Consistency Score (0-10 points)
    let consistencyScore = 10;
    if (incomes.length === 0 && expenses.length === 0) {
      consistencyScore = 0;
    } else if (incomes.length < 3 || expenses.length < 3) {
      consistencyScore = 5;
    }

    const totalScore = savingsScore + expenseScore + goalScore + investmentScore + consistencyScore;
    const healthLevel = totalScore >= 80 ? 'excellent' : 
                       totalScore >= 65 ? 'good' : 
                       totalScore >= 50 ? 'fair' : 
                       totalScore >= 35 ? 'needs_improvement' : 'poor';

    return {
      score: Math.min(100, Math.round(totalScore)),
      level: healthLevel,
      breakdown: {
        savingsRate: {
          score: savingsScore,
          value: savingsRate,
          max: 30,
        },
        expenseManagement: {
          score: expenseScore,
          max: 25,
        },
        goalProgress: {
          score: goalScore,
          max: 20,
        },
        investmentDiversification: {
          score: investmentScore,
          max: 15,
        },
        consistency: {
          score: consistencyScore,
          max: 10,
        },
      },
      recommendations: generateRecommendations(totalScore, savingsRate, expenseScore, goalScore, investmentScore),
    };
  } catch (error) {
    console.error('Error calculating financial health:', error);
    return {
      score: 0,
      level: 'poor',
      breakdown: {},
      recommendations: [],
    };
  }
};

const generateRecommendations = (score, savingsRate, expenseScore, goalScore, investmentScore) => {
  const recommendations = [];
  
  if (savingsRate < 10) {
    recommendations.push({
      type: 'savings',
      priority: 'high',
      message: 'Aim to save at least 10% of your income. Start with small amounts and gradually increase.',
    });
  }
  
  if (expenseScore < 20) {
    recommendations.push({
      type: 'budget',
      priority: 'high',
      message: 'Review your budgets. Some categories are exceeding limits. Track spending more closely.',
    });
  }
  
  if (goalScore < 15) {
    recommendations.push({
      type: 'goals',
      priority: 'medium',
      message: 'Set clear financial goals and track progress regularly. Break large goals into smaller milestones.',
    });
  }
  
  if (investmentScore < 10) {
    recommendations.push({
      type: 'investment',
      priority: 'medium',
      message: 'Consider diversifying your investments across different asset types for better risk management.',
    });
  }
  
  if (score >= 80) {
    recommendations.push({
      type: 'maintain',
      priority: 'low',
      message: 'Great job! Maintain your current financial habits and continue tracking your progress.',
    });
  }
  
  return recommendations;
};

