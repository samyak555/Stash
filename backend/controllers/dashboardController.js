import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';

export const getDashboard = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const incomes = await Income.find({ user: req.user._id });
    const budgets = await Budget.find({ user: req.user._id });
    const goals = await Goal.find({ user: req.user._id });
    
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
