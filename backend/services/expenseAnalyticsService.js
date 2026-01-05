import fileDB from '../utils/fileDB.js';

/**
 * Advanced Expense Analytics
 * - Spending patterns
 * - Category trends
 * - Monthly comparisons
 * - Spending velocity
 * - Peak spending days
 */
export const getExpenseAnalytics = async (userId, timeRange = 'month') => {
  try {
    const expenses = fileDB.findExpenses({ user: userId });
    const incomes = fileDB.findIncomes({ user: userId });

    if (expenses.length === 0) {
      return {
        categoryBreakdown: [],
        monthlyTrend: [],
        spendingVelocity: 0,
        averageTransaction: 0,
        peakSpendingDay: null,
        topCategories: [],
        monthlyComparison: null,
      };
    }

    const now = new Date();
    let startDate, endDate;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = now;
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      endDate = now;
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    }

    // Filter expenses by time range
    const filteredExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date || e.createdAt);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Category Breakdown
    const categoryMap = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Others';
      const amount = parseFloat(expense.amount) || 0;
      if (!categoryMap[category]) {
        categoryMap[category] = { category, total: 0, count: 0 };
      }
      categoryMap[category].total += amount;
      categoryMap[category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap)
      .map(cat => ({
        ...cat,
        percentage: filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) > 0
          ? (cat.total / filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)) * 100
          : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly Trend (last 6 months)
    const monthlyData = {};
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, expenses: 0, income: 0 };
      }
      monthlyData[monthKey].expenses += parseFloat(expense.amount) || 0;
    });

    incomes.forEach(income => {
      const incomeDate = new Date(income.date || income.createdAt);
      const monthKey = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].income += parseFloat(income.amount) || 0;
      }
    });

    const monthlyTrend = Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => ({
        ...monthlyData[key],
        savings: monthlyData[key].income - monthlyData[key].expenses,
      }));

    // Spending Velocity (average daily spending)
    const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const totalSpending = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const spendingVelocity = totalSpending / daysDiff;

    // Average Transaction Size
    const averageTransaction = filteredExpenses.length > 0
      ? totalSpending / filteredExpenses.length
      : 0;

    // Peak Spending Day
    const dayMap = {};
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const dayName = expenseDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayMap[dayName]) {
        dayMap[dayName] = 0;
      }
      dayMap[dayName] += parseFloat(expense.amount) || 0;
    });

    const peakSpendingDay = Object.keys(dayMap).length > 0
      ? Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]
      : null;

    // Top Categories
    const topCategories = categoryBreakdown.slice(0, 5);

    // Monthly Comparison
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const previousMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
    
    const currentMonthData = monthlyData[currentMonth] || { expenses: 0 };
    const previousMonthData = monthlyData[previousMonth] || { expenses: 0 };
    
    const monthlyComparison = {
      current: currentMonthData.expenses,
      previous: previousMonthData.expenses,
      change: currentMonthData.expenses - previousMonthData.expenses,
      changePercent: previousMonthData.expenses > 0
        ? ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100
        : 0,
    };

    return {
      categoryBreakdown,
      monthlyTrend,
      spendingVelocity,
      averageTransaction,
      peakSpendingDay: peakSpendingDay ? { day: peakSpendingDay[0], amount: peakSpendingDay[1] } : null,
      topCategories,
      monthlyComparison,
    };
  } catch (error) {
    console.error('Error calculating expense analytics:', error);
    return {
      categoryBreakdown: [],
      monthlyTrend: [],
      spendingVelocity: 0,
      averageTransaction: 0,
      peakSpendingDay: null,
      topCategories: [],
      monthlyComparison: null,
    };
  }
};

