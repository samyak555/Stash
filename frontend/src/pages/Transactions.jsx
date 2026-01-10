import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { formatExpense } from '../utils/formatDisplayValue';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    merchant: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction._id, formData);
        toast.success('Transaction updated');
      } else {
        await transactionAPI.create(formData);
        toast.success('Transaction added');
      }
      fetchTransactions();
      resetForm();
    } catch (error) {
      toast.error('Failed to save transaction');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await transactionAPI.delete(id);
        toast.success('Transaction deleted');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type || 'debit',
      merchant: transaction.merchant || '',
      category: transaction.category || 'Others',
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'debit',
      merchant: '',
      category: 'Others',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-slate-400">View and manage your financial transactions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Transaction'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-white/10 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="debit">Expense (Debit)</option>
                <option value="credit">Income (Credit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Merchant/Title</label>
              <input
                type="text"
                required
                value={formData.merchant}
                onChange={e => setFormData({ ...formData, merchant: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Starbucks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                placeholder="Optional details"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Merchant / Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!transactions || transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-slate-500 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-slate-400 text-base font-normal mb-1">No transactions yet</p>
                      <p className="text-slate-500 text-sm font-normal">Add a transaction to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300 font-normal">
                      {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {transaction.merchant || transaction.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-normal">
                      {transaction.category || 'Uncategorized'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold ${transaction.type === 'income' || transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {transaction.type === 'income' || transaction.type === 'credit' ? '+' : '-'}
                      {formatExpense(Math.abs(transaction.amount || 0))}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(transaction)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(transaction._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;


















