import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incomeAPI, expenseAPI, goalAPI } from '../services/api';
import Button from './ui/Button';
import toast from 'react-hot-toast';

const Onboarding = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    income: '',
    expenseAmount: '',
    expenseCategory: 'Food',
    expenseDate: new Date().toISOString().split('T')[0],
    goalTitle: '',
    goalAmount: '',
    goalDeadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [safeToSpend, setSafeToSpend] = useState(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const categories = ['Food', 'Travel', 'Movie', 'Clothes', 'Transportation', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Others'];

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.income || parseFloat(formData.income) <= 0) {
      toast.error('Please enter a valid income amount');
      return;
    }
    setLoading(true);
    try {
      await incomeAPI.create({
        amount: formData.income,
        source: 'Salary',
        date: new Date().toISOString().split('T')[0],
        note: 'Onboarding entry',
      });
      localStorage.setItem('hasIncomeData', 'true');
      setStep(2);
    } catch (error) {
      toast.error('Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!formData.expenseAmount || parseFloat(formData.expenseAmount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    setLoading(true);
    try {
      await expenseAPI.create({
        amount: formData.expenseAmount,
        category: formData.expenseCategory,
        date: formData.expenseDate,
        note: 'Onboarding entry',
      });
      localStorage.setItem('hasExpenseData', 'true');
      setStep(3);
    } catch (error) {
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goalTitle || !formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
      toast.error('Please fill all goal fields');
      return;
    }
    setLoading(true);
    try {
      await goalAPI.create({
        title: formData.goalTitle,
        targetAmount: formData.goalAmount,
        deadline: formData.goalDeadline,
        description: 'Onboarding goal',
      });
      
      // Calculate safe-to-spend
      const monthlyIncome = parseFloat(formData.income);
      const dailyIncome = monthlyIncome / 30;
      const expenseAmount = parseFloat(formData.expenseAmount);
      const goalAmount = parseFloat(formData.goalAmount);
      const daysUntilGoal = Math.ceil((new Date(formData.goalDeadline) - new Date()) / (1000 * 60 * 60 * 24));
      const dailyGoalSavings = daysUntilGoal > 0 ? goalAmount / daysUntilGoal : 0;
      const safeToday = Math.max(0, dailyIncome - (expenseAmount / 30) - dailyGoalSavings);
      
      setSafeToSpend(safeToday);
      setStep(4);
    } catch (error) {
      toast.error('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {/* Step 1: Income */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">What's your monthly income?</h2>
                <p className="text-slate-400 text-sm">This helps us calculate your spending capacity</p>
              </div>
              
              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    placeholder="Enter monthly income"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-lg text-center font-semibold"
                    autoFocus
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </form>

              {/* Trust Message */}
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-xs text-cyan-300 text-center leading-relaxed">
                  🔒 We do not access your bank account. You stay in full control of your data.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Expense */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Add your first expense</h2>
                <p className="text-slate-400 text-sm">Track where your money goes</p>
              </div>
              
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.expenseAmount}
                    onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.expenseCategory}
                    onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Set your first goal</h2>
                <p className="text-slate-400 text-sm">What are you saving for?</p>
              </div>
              
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                    placeholder="e.g., New Laptop"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.goalDeadline}
                    onChange={(e) => setFormData({ ...formData, goalDeadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Insight */}
          {step === 4 && safeToSpend !== null && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
              <div className="glass-card rounded-xl p-6 border border-cyan-500/20 bg-cyan-500/5">
                <p className="text-sm text-slate-400 mb-3">Based on your income and goals:</p>
                <p className="text-4xl font-bold text-cyan-400 mb-2">
                  ₹{Math.round(safeToSpend).toLocaleString()}
                </p>
                <p className="text-lg text-white font-medium">Safe to spend today</p>
              </div>
              <p className="text-slate-400 text-sm">
                This updates daily based on your income, expenses, and goals.
              </p>
              <Button variant="primary" className="w-full" onClick={handleComplete}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

