import { useState, useEffect } from 'react';
import { incomeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { IncomeIcon } from '../components/Icons';
import Logo from '../components/Logo';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const sources = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Allowance', 'Others'];

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await incomeAPI.getAll();
      setIncomes(response.data || []);
    } catch (error) {
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await incomeAPI.update(editingIncome._id, formData);
        toast.success('Income updated successfully');
      } else {
        await incomeAPI.create(formData);
        toast.success('Income added successfully');
      }
      fetchIncomes();
      resetForm();
    } catch (error) {
      toast.error('Failed to save income');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount,
      source: income.source,
      date: new Date(income.date).toISOString().split('T')[0],
      note: income.note || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeAPI.delete(id);
        toast.success('Income deleted successfully');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: 'Salary',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setEditingIncome(null);
    setShowForm(false);
  };

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);

  // Calculate by source
  const sourceTotals = incomes.reduce((acc, income) => {
    const source = income.source || 'Others';
    acc[source] = (acc[source] || 0) + parseFloat(income.amount || 0);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-[15px]" style={{ lineHeight: '1.6' }}>Loading income...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 animate-fade-in">
      {/* Header Section - 64px spacing */}
      <div className="mb-16">
        <Logo size="default" showText={true} className="mb-6" />
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-white mb-3 flex items-center leading-tight">
              <IncomeIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-green-400 opacity-70" />
              Income
            </h1>
            <p className="text-[15px] text-gray-400" style={{ lineHeight: '1.75', opacity: 0.7 }}>
              A clear overview of all your income streams
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-[15px] flex items-center transition-colors"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Add new income'}
          </button>
        </div>
      </div>

      {/* Total Income Card - 32px padding */}
      <div className="glass-light rounded-xl p-8 mb-12 border border-green-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] text-gray-400 mb-3 uppercase tracking-[0.08em] font-medium" style={{ opacity: 0.7 }}>
              Total income this period
            </p>
            <p className="text-[48px] font-bold text-green-400 leading-tight">₹{totalIncome.toFixed(2)}</p>
          </div>
          <IncomeIcon className="w-16 h-16 text-green-400 opacity-30" />
        </div>
      </div>

      {/* Source Breakdown - 24px padding cards */}
      {Object.keys(sourceTotals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {Object.entries(sourceTotals).map(([source, total]) => (
            <div key={source} className="glass-light rounded-xl p-6 border border-gray-700/50">
              <p className="text-[12px] text-gray-400 mb-2 uppercase tracking-[0.08em]" style={{ opacity: 0.7 }}>
                {source}
              </p>
              <p className="text-[20px] font-semibold text-white leading-tight">₹{total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form Section - 32px padding */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-light p-8 rounded-xl mb-12 border border-gray-700/30">
          <h2 className="text-[18px] font-semibold text-white mb-6">
            {editingIncome ? 'Edit income entry' : 'Add new income'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-gray-300 mb-2.5" style={{ lineHeight: '1.6' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                style={{ lineHeight: '1.6' }}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-300 mb-2.5" style={{ lineHeight: '1.6' }}>
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                style={{ lineHeight: '1.6' }}
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-300 mb-2.5" style={{ lineHeight: '1.6' }}>
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                style={{ lineHeight: '1.6' }}
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-300 mb-2.5" style={{ lineHeight: '1.6' }}>
                Note <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-5 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                style={{ lineHeight: '1.6' }}
                placeholder="Add a note..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold text-[15px] transition-colors"
            >
              {editingIncome ? 'Update income' : 'Add income'}
            </button>
            {editingIncome && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-700/50 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-medium text-[15px] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Table Section - Premium spacing */}
      <div className="glass-light rounded-xl overflow-hidden border border-gray-700/30">
        <table className="min-w-full">
          <thead className="bg-gray-800/30">
            <tr>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-gray-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Date
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-gray-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Source
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-gray-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Amount
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-gray-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Note
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-gray-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <IncomeIcon className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
                    <p className="text-[15px] text-gray-400 mb-1" style={{ lineHeight: '1.75' }}>
                      No income recorded yet
                    </p>
                    <p className="text-[14px] text-gray-500" style={{ lineHeight: '1.6', opacity: 0.7 }}>
                      Start by adding your first entry
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income._id} className="hover:bg-gray-800/20 transition-colors" style={{ minHeight: '56px' }}>
                  <td className="px-8 py-4 text-[15px] text-gray-300" style={{ lineHeight: '1.75' }}>
                    {new Date(income.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-gray-300" style={{ lineHeight: '1.75' }}>
                    {income.source}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-white font-semibold" style={{ lineHeight: '1.75' }}>
                    ₹{parseFloat(income.amount).toFixed(2)}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-gray-400" style={{ lineHeight: '1.75', opacity: 0.7 }}>
                    {income.note || '-'}
                  </td>
                  <td className="px-8 py-4 text-[15px]">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(income)}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(income._id)}
                        className="text-red-400 hover:text-red-300 transition-colors font-medium"
                      >
                        Delete
                      </button>
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

export default Income;
