import fileDB from '../utils/fileDB.js';

export const getDashboard = async (req, res) => {
  try {
    const expenses = fileDB.findExpenses({ user: req.user._id });
    const incomes = fileDB.findIncomes({ user: req.user._id });
    const budgets = fileDB.findBudgets({ user: req.user._id });
    const goals = fileDB.findGoals({ user: req.user._id });
    
    const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const balance = totalIncome - totalExpenses;
    
    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance,
      },
      budgets: budgets.length,
      activeGoals: goals.filter(g => g.status !== 'completed').length,
      monthlyTrend: [],
      categoryBreakdown: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


