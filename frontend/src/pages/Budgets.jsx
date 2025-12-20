import { useState, useEffect } from 'react';
import { budgetAPI, expenseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BudgetsIcon } from '../components/Icons';
import Logo from '../components/Logo';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  });

  const categories = [
    'Food', 'Travel', 'Movie', 'Clothes', 'Transportation',
    'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare',
    'Education', 'Insurance', 'Personal Care', 'Family', 'Gifts',
    'Subscriptions', 'Dining Out', 'Groceries', 'Bills', 'Others'
  ];

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, [formData.month]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getAll({ month: formData.month });
      setBudgets(response.data || []);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetAPI.create(formData);
      toast.success('Budget set successfully');
      fetchBudgets();
      resetForm();
    } catch (error) {
      toast.error('Failed to set budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.delete(id);
        toast.success('Budget deleted successfully');
        fetchBudgets();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Food',
      amount: '',
      month: new Date().toISOString().slice(0, 7),
    });
    setShowForm(false);
  };

  // Calculate spent amount for each budget
  const budgetsWithSpending = budgets.map(budget => {
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const budgetMonth = new Date(budget.month + '-01');
      return exp.category === budget.category &&
             expDate.getMonth() === budgetMonth.getMonth() &&
             expDate.getFullYear() === budgetMonth.getFullYear();
    });
    const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const remaining = parseFloat(budget.amount) - totalSpent;
    const progress = (totalSpent / parseFloat(budget.amount)) * 100;
    
    return {
      ...budget,
      totalSpent,
      remaining,
      progress: Math.min(progress, 100),
      isExceeded: totalSpent > parseFloat(budget.amount)
    };
  });

  if (loading) {
    return <div className="text-center py-8 text-white">Loading budgets...</div>;
  }

  return (
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Logo size="default" showText={true} className="mb-4" />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 flex items-center">
              <BudgetsIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-purple-400" />
              Budgets
            </h1>
            <p className="text-slate-400">Set and track your spending limits</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center text-sm sm:text-base"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Set Budget'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-light p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Set Monthly Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Month</label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
            Set Budget
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetsWithSpending.length === 0 ? (
          <div className="col-span-full glass-light rounded-xl p-12 text-center">
            <BudgetsIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No budgets set for this month</p>
            <p className="text-slate-500 text-sm mt-2">Set your first budget to get started!</p>
          </div>
        ) : (
          budgetsWithSpending.map((budget) => (
            <div
              key={budget._id}
              className={`glass-light rounded-xl p-6 border ${
                budget.isExceeded ? 'border-red-500/50' : 'border-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{budget.category}</h3>
                  <p className="text-sm text-slate-400">{new Date(budget.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <button
                  onClick={() => handleDelete(budget._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget:</span>
                  <span className="font-bold text-white">₹{parseFloat(budget.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spent:</span>
                  <span className={`font-bold ${budget.isExceeded ? 'text-red-400' : 'text-yellow-400'}`}>
                    ₹{budget.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining:</span>
                  <span className={`font-bold ${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{budget.remaining.toFixed(2)}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full ${
                        budget.isExceeded
                          ? 'bg-red-500'
                          : budget.progress > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{budget.progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Budgets;
