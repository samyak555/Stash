import { useState, useEffect } from 'react';
import { aiAPI, expenseAPI, incomeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { InsightsIcon } from '../components/Icons';
import Logo from '../components/Logo';
import AICoach from '../components/AICoach';
import FinancialHealthScore from '../components/FinancialHealthScore';
import ExpenseAnalytics from '../components/ExpenseAnalytics';
import BudgetAnalytics from '../components/BudgetAnalytics';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [insights, setInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    fetchExpenses();
    fetchIncomes();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await aiAPI.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
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

  const fetchIncomes = async () => {
    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Coach & Insights' },
    { id: 'health', label: 'Financial Health' },
    { id: 'expenses', label: 'Expense Analytics' },
    { id: 'budgets', label: 'Budget Analytics' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-slate-400">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight flex items-center">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mr-4">
              <InsightsIcon className="w-8 h-8 text-purple-400" />
            </div>
            Stash Insight
          </h1>
          <p className="text-slate-400 text-lg font-normal ml-14">
            Unified analytics and AI-powered recommendations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-700/50 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all duration-200 rounded-t-lg border-b-2 text-sm sm:text-base ${activeTab === tab.id
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'ai' && (
          <div className="animate-fade-in space-y-8">
            <AICoach expenses={expenses} incomes={incomes} />

            <div className="glass-card rounded-2xl p-8 border border-white/10">
              {insights ? (
                <div>
                  <div className="mb-8 items-center justify-center flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Financial Score</h2>
                    <div className="relative w-40 h-40">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#1f2937"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#8b5cf6"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(insights.healthScore || 0) * 4.4} 440`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{insights.healthScore || 0}</span>
                      </div>
                    </div>
                  </div>

                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-4">Smart Recommendations</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {insights.recommendations.map((rec, index) => (
                          <div key={index} className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-5 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <p className="text-slate-300 leading-relaxed font-normal">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.insights && insights.insights.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Key Observations</h3>
                      <div className="space-y-3">
                        {insights.insights.map((insight, index) => (
                          <div key={index} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 mr-3 shrink-0" />
                            <p className="text-slate-300 font-normal">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <InsightsIcon className="w-20 h-20 text-slate-600 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl text-white font-medium mb-2">No insights generated yet</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Start adding your expenses and income. Stash will analyze your data and provide personalized financial advice.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'health' && <FinancialHealthScore />}
        {activeTab === 'expenses' && <ExpenseAnalytics />}
        {activeTab === 'budgets' && <BudgetAnalytics />}
      </div>
    </div>
  );
};

export default Insights;
