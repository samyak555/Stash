import { useState, useEffect } from 'react';
import { incomeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { IncomeIcon } from '../components/Icons';
import Logo from '../components/Logo';
import { formatIncome } from '../utils/formatDisplayValue';

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
    <div className="px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mr-4">
                <IncomeIcon className="w-7 h-7 text-cyan-400" />
              </div>
              Income
            </h1>
            <p className="text-slate-400 text-lg font-normal">A clear overview of all your income streams</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-premium text-white px-6 py-3.5 rounded-xl font-semibold flex items-center text-base whitespace-nowrap"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Add Income'}
          </button>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="glass-card rounded-2xl p-8 mb-10 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-4 uppercase tracking-wider font-normal">
              Total income this period
            </p>
            <p className="text-5xl font-bold text-gradient-cyan-pink tracking-tight">{formatIncome(totalIncome)}</p>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <IncomeIcon className="w-12 h-12 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      {Object.keys(sourceTotals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {Object.entries(sourceTotals).map(([source, total]) => (
            <div key={source} className="glass-card rounded-xl p-6 border border-white/10">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-normal">
                {source}
              </p>
              <p className="text-[20px] font-semibold text-white leading-tight">{formatIncome(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl mb-10 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
            {editingIncome ? 'Edit Income Entry' : 'Add New Income'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-slate-200 mb-2.5" style={{ lineHeight: '1.6' }}>
                Amount (₹)
              </label>
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
              <label className="block text-[14px] font-medium text-slate-200 mb-2.5" style={{ lineHeight: '1.6' }}>
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-200 mb-2.5" style={{ lineHeight: '1.6' }}>
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-200 mb-2.5" style={{ lineHeight: '1.6' }}>
                Note <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="Add a note..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              type="submit" 
              className="btn-premium text-white px-6 py-3.5 rounded-xl font-semibold"
            >
              {editingIncome ? 'Update Income' : 'Add Income'}
            </button>
            {editingIncome && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Table Section */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-slate-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Date
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-slate-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Source
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-slate-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Amount
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-slate-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Note
              </th>
              <th className="px-8 py-4 text-left text-[12px] font-medium text-slate-400 uppercase tracking-[0.08em]" style={{ lineHeight: '1.6' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <IncomeIcon className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                    <p className="text-base text-slate-400 mb-1 font-normal">No income recorded yet</p>
                    <p className="text-sm text-slate-500 font-normal">Start by adding your first entry</p>
                  </div>
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income._id} className="hover:bg-gray-800/20 transition-colors" style={{ minHeight: '56px' }}>
                  <td className="px-8 py-4 text-[15px] text-slate-200" style={{ lineHeight: '1.75' }}>
                    {new Date(income.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-slate-200" style={{ lineHeight: '1.75' }}>
                    {income.source}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-white font-semibold" style={{ lineHeight: '1.75' }}>
                    {formatIncome(income.amount)}
                  </td>
                  <td className="px-8 py-4 text-[15px] text-slate-400" style={{ lineHeight: '1.75', opacity: 0.7 }}>
                    {income.note || '-'}
                  </td>
                  <td className="px-8 py-4 text-[15px]">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(income)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
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
