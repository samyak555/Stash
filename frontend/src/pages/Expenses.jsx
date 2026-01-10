import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useExpenses } from '../contexts/ExpenseContext';
import { ExpensesIcon, FoodIcon, TravelIcon, MovieIcon, ClothesIcon, ShoppingIcon } from '../components/Icons';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import { formatExpense } from '../utils/formatDisplayValue';

const Expenses = () => {
  const { expenses, loading, fetchExpenses, refetchExpenses } = useExpenses();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const categories = [
    'Food', 'Travel', 'Movie', 'Clothes', 'Transportation',
    'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare',
    'Education', 'Insurance', 'Personal Care', 'Family', 'Gifts',
    'Subscriptions', 'Dining Out', 'Groceries', 'Bills', 'Others'
  ];

  const categoryIcons = {
    'Food': <FoodIcon className="w-5 h-5" />,
    'Travel': <TravelIcon className="w-5 h-5" />,
    'Movie': <MovieIcon className="w-5 h-5" />,
    'Clothes': <ClothesIcon className="w-5 h-5" />,
    'Shopping': <ShoppingIcon className="w-5 h-5" />,
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingExpense) {
        await expenseAPI.update(editingExpense._id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expenseAPI.create(formData);
        toast.success('Expense added successfully');
      }
      // Refetch expenses and trigger all dependent UI updates
      await refetchExpenses();
      resetForm();
    } catch (error) {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      note: expense.note || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        toast.success('Expense deleted successfully');
        // Refetch expenses and trigger all dependent UI updates
        await refetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  // Calculate totals by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'Others';
    acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-8 text-white">Loading expenses...</div>;
  }

  return (
    <div className="px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center">
              <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 mr-4">
                <ExpensesIcon className="w-7 h-7 text-pink-400" />
              </div>
              Expenses
            </h1>
            <p className="text-slate-400 text-lg font-normal">Track and manage your spending</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
            leftIcon={<span>{showForm ? '✕' : '+'}</span>}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            {showForm ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>
      </div>

      {/* Category Summary Cards */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([category, total]) => (
              <div key={category} className="glass-card rounded-xl p-5 border border-white/10 transition-all">
                <div className="flex items-center mb-3 text-slate-400">
                  {categoryIcons[category] || <ShoppingIcon className="w-5 h-5" />}
                </div>
                <p className="text-xs text-slate-400 mb-2 font-normal uppercase tracking-wider">{category}</p>
                <p className="text-xl font-bold text-white tracking-tight">{formatExpense(total)}</p>
              </div>
            ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl mb-10 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">Note (Optional)</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="Add a note..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
            >
              {saving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
            {editingExpense && (
              <Button type="button" onClick={resetForm} variant="ghost">
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Note</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <ExpensesIcon className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                    <p className="text-slate-400 text-base font-normal mb-1">No expenses yet</p>
                    <p className="text-slate-500 text-sm font-normal">Add your first expense to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300 font-normal">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 flex items-center font-normal">
                    {categoryIcons[expense.category] && <span className="mr-2">{categoryIcons[expense.category]}</span>}
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{formatExpense(expense.amount)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-normal">{expense.note || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(expense)}
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(expense._id)}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
