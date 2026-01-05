import { useState, useEffect } from 'react';
import { netWorthAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import LoadingDots from '../components/LoadingDots';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const NetWorth = () => {
  const [netWorth, setNetWorth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCash, setShowAddCash] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [cashForm, setCashForm] = useState({
    accountName: '',
    accountType: 'savings',
    balance: '',
  });
  const [liabilityForm, setLiabilityForm] = useState({
    type: 'loan',
    name: '',
    amount: '',
    interestRate: '',
  });

  const fetchNetWorth = async () => {
    try {
      setLoading(true);
      const response = await netWorthAPI.getNetWorth();
      setNetWorth(response.data);
    } catch (error) {
      console.error('Error fetching net worth:', error);
      toast.error('Failed to load net worth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetWorth();
    // Refresh every 15 seconds for live prices
    const interval = setInterval(fetchNetWorth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCash = async (e) => {
    e.preventDefault();
    try {
      await netWorthAPI.addCashBalance({
        ...cashForm,
        balance: parseFloat(cashForm.balance),
      });
      toast.success('Cash balance added');
      setShowAddCash(false);
      setCashForm({ accountName: '', accountType: 'savings', balance: '' });
      fetchNetWorth();
    } catch (error) {
      toast.error('Failed to add cash balance');
    }
  };

  const handleAddLiability = async (e) => {
    e.preventDefault();
    try {
      await netWorthAPI.addLiability({
        ...liabilityForm,
        amount: parseFloat(liabilityForm.amount),
        interestRate: parseFloat(liabilityForm.interestRate) || 0,
      });
      toast.success('Liability added');
      setShowAddLiability(false);
      setLiabilityForm({ type: 'loan', name: '', amount: '', interestRate: '' });
      fetchNetWorth();
    } catch (error) {
      toast.error('Failed to add liability');
    }
  };

  const handleDeleteCash = async (id) => {
    if (!window.confirm('Delete this cash balance?')) return;
    try {
      await netWorthAPI.deleteCashBalance(id);
      toast.success('Cash balance deleted');
      fetchNetWorth();
    } catch (error) {
      toast.error('Failed to delete cash balance');
    }
  };

  const handleDeleteLiability = async (id) => {
    if (!window.confirm('Delete this liability?')) return;
    try {
      await netWorthAPI.deleteLiability(id);
      toast.success('Liability deleted');
      fetchNetWorth();
    } catch (error) {
      toast.error('Failed to delete liability');
    }
  };

  if (loading && !netWorth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!netWorth) {
    return null;
  }

  const assets = netWorth.assets || {};
  const liabilities = netWorth.liabilities || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Net Worth</h1>
          <p className="text-slate-400">Your complete financial snapshot</p>
        </div>

        {/* Net Worth Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 mb-6">
          <div className="text-center">
            <p className="text-slate-400 mb-2">Total Net Worth</p>
            <p className="text-5xl font-bold text-white mb-4">
              {formatIncome(netWorth.netWorth || 0)}
            </p>
            <p className="text-sm text-slate-400">
              Last updated: {new Date(netWorth.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Assets</h2>
              <Button onClick={() => setShowAddCash(true)} variant="primary" size="sm">
                + Add Cash
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cash & Bank</span>
                <span className="text-white font-semibold">{formatIncome(assets.cash || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Stocks</span>
                <span className="text-white font-semibold">{formatIncome(assets.stocks || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Crypto</span>
                <span className="text-white font-semibold">{formatIncome(assets.crypto || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mutual Funds</span>
                <span className="text-white font-semibold">{formatIncome(assets.mutualFunds || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gold</span>
                <span className="text-white font-semibold">{formatIncome(assets.gold || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Silver</span>
                <span className="text-white font-semibold">{formatIncome(assets.silver || 0)}</span>
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Assets</span>
                  <span className="text-teal-400 font-bold text-lg">{formatIncome(assets.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Cash Balances List */}
            {netWorth.cashBalances && netWorth.cashBalances.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Cash Accounts</h3>
                <div className="space-y-2">
                  {netWorth.cashBalances.map((cb) => (
                    <div key={cb.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm">{cb.accountName}</p>
                        <p className="text-slate-400 text-xs">{cb.accountType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">{formatIncome(cb.balance)}</span>
                        <Button
                          onClick={() => handleDeleteCash(cb.id)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Liabilities */}
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Liabilities</h2>
              <Button onClick={() => setShowAddLiability(true)} variant="primary" size="sm">
                + Add Liability
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Liabilities</span>
                  <span className="text-red-400 font-bold text-lg">{formatIncome(liabilities.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities List */}
            {liabilities.breakdown && liabilities.breakdown.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Your Liabilities</h3>
                <div className="space-y-2">
                  {liabilities.breakdown.map((liab) => (
                    <div key={liab.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-white text-sm font-medium">{liab.name}</p>
                          <p className="text-slate-400 text-xs">{liab.type}</p>
                        </div>
                        <span className="text-red-400 font-semibold">{formatIncome(liab.amount)}</span>
                      </div>
                      {liab.interestRate > 0 && (
                        <p className="text-slate-400 text-xs">Interest: {liab.interestRate}%</p>
                      )}
                      <div className="mt-2 flex justify-end">
                        <Button
                          onClick={() => handleDeleteLiability(liab.id)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Cash Modal */}
        {showAddCash && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 border border-white/10 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Add Cash Balance</h2>
              <form onSubmit={handleAddCash}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Account Name</label>
                    <input
                      type="text"
                      value={cashForm.accountName}
                      onChange={(e) => setCashForm({ ...cashForm, accountName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Account Type</label>
                    <select
                      value={cashForm.accountType}
                      onChange={(e) => setCashForm({ ...cashForm, accountType: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashForm.balance}
                      onChange={(e) => setCashForm({ ...cashForm, balance: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" variant="primary">Add</Button>
                  <Button type="button" onClick={() => setShowAddCash(false)} variant="ghost">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Liability Modal */}
        {showAddLiability && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 border border-white/10 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Add Liability</h2>
              <form onSubmit={handleAddLiability}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Type</label>
                    <select
                      value={liabilityForm.type}
                      onChange={(e) => setLiabilityForm({ ...liabilityForm, type: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="loan">Loan</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Name</label>
                    <input
                      type="text"
                      value={liabilityForm.name}
                      onChange={(e) => setLiabilityForm({ ...liabilityForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={liabilityForm.amount}
                      onChange={(e) => setLiabilityForm({ ...liabilityForm, amount: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={liabilityForm.interestRate}
                      onChange={(e) => setLiabilityForm({ ...liabilityForm, interestRate: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" variant="primary">Add</Button>
                  <Button type="button" onClick={() => setShowAddLiability(false)} variant="ghost">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Stash does not facilitate investments or provide financial advice.
            Market data and news are sourced from public third-party providers and may be delayed or inaccurate.
            This application is for tracking and informational purposes only and is not regulated by SEBI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetWorth;

