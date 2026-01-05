import fileDB from '../utils/fileDB.js';

/**
 * Advanced Budget Analytics
 * - Budget vs Actual
 * - Category-wise performance
 * - Budget utilization trends
 */
export const getBudgetAnalytics = async (userId) => {
  try {
    const budgets = fileDB.findBudgets({ user: userId });
    const expenses = fileDB.findExpenses({ user: userId });

    if (budgets.length === 0) {
      return {
        budgets: [],
        totalBudget: 0,
        totalSpent: 0,
        utilization: 0,
        overBudget: [],
        underBudget: [],
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const budgetAnalytics = budgets
      .filter(budget => {
        const budgetDate = new Date(budget.month || budget.createdAt);
        return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
      })
      .map(budget => {
        const monthlyExpenses = expenses
          .filter(e => {
            const expenseDate = new Date(e.date || e.createdAt);
            return expenseDate.getMonth() === currentMonth &&
                   expenseDate.getFullYear() === currentYear &&
                   e.category === budget.category;
          })
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        const budgetAmount = parseFloat(budget.amount) || 0;
        const utilization = budgetAmount > 0 ? (monthlyExpenses / budgetAmount) * 100 : 0;
        const remaining = budgetAmount - monthlyExpenses;
        const isOverBudget = monthlyExpenses > budgetAmount;

        return {
          category: budget.category,
          budget: budgetAmount,
          spent: monthlyExpenses,
          remaining: remaining,
          utilization: utilization,
          isOverBudget: isOverBudget,
          status: utilization >= 100 ? 'exceeded' :
                  utilization >= 90 ? 'warning' :
                  utilization >= 75 ? 'moderate' : 'good',
        };
      });

    const totalBudget = budgetAnalytics.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = budgetAnalytics.reduce((sum, b) => sum + b.spent, 0);
    const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const overBudget = budgetAnalytics.filter(b => b.isOverBudget);
    const underBudget = budgetAnalytics.filter(b => !b.isOverBudget && b.utilization < 90);

    return {
      budgets: budgetAnalytics,
      totalBudget,
      totalSpent,
      utilization: overallUtilization,
      overBudget,
      underBudget,
    };
  } catch (error) {
    console.error('Error calculating budget analytics:', error);
    return {
      budgets: [],
      totalBudget: 0,
      totalSpent: 0,
      utilization: 0,
      overBudget: [],
      underBudget: [],
    };
  }
};

