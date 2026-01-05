import { useState } from 'react';
import FinancialHealthScore from '../components/FinancialHealthScore';
import ExpenseAnalytics from '../components/ExpenseAnalytics';
import BudgetAnalytics from '../components/BudgetAnalytics';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('health');

  const tabs = [
    { id: 'health', label: 'Financial Health' },
    { id: 'expenses', label: 'Expense Analytics' },
    { id: 'budgets', label: 'Budget Analytics' },
  ];

  return (
    <div className="px-4 py-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-3">
          Analytics & Insights
        </h1>
        <p className="text-slate-400 text-lg">
          Deep dive into your financial patterns and performance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'health' && <FinancialHealthScore />}
        {activeTab === 'expenses' && <ExpenseAnalytics />}
        {activeTab === 'budgets' && <BudgetAnalytics />}
      </div>
    </div>
  );
};

export default Analytics;

