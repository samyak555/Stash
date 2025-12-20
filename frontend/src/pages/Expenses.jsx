import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ExpensesIcon, FoodIcon, TravelIcon, MovieIcon, ClothesIcon, ShoppingIcon } from '../components/Icons';
import Logo from '../components/Logo';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getAll();
      setExpenses(response.data || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseAPI.update(editingExpense._id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expenseAPI.create(formData);
        toast.success('Expense added successfully');
      }
      fetchExpenses();
      resetForm();
    } catch (error) {
      toast.error('Failed to save expense');
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
        fetchExpenses();
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
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Logo size="default" showText={true} className="mb-4" />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center">
              <ExpensesIcon className="w-8 h-8 mr-3 text-red-400" />
              Expenses
            </h1>
            <p className="text-gray-400">Track and manage your spending</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Add Expense'}
          </button>
        </div>
      </div>

      {/* Category Summary Cards */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([category, total]) => (
              <div key={category} className="glass-light rounded-xl p-4 border border-gray-700">
                <div className="flex items-center mb-2 text-gray-400">
                  {categoryIcons[category] || <ShoppingIcon className="w-5 h-5" />}
                </div>
                <p className="text-xs text-gray-400 mb-1">{category}</p>
                <p className="text-lg font-bold text-white">₹{total.toFixed(2)}</p>
              </div>
            ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-light p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Note (Optional)</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              {editingExpense ? 'Update' : 'Add'} Expense
            </button>
            {editingExpense && (
              <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="glass-light rounded-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No expenses yet. Add your first expense!
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-300">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 flex items-center">
                    {categoryIcons[expense.category] && <span className="mr-2">{categoryIcons[expense.category]}</span>}
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">₹{parseFloat(expense.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{expense.note || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
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
