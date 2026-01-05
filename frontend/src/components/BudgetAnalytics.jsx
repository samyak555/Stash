import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatExpense } from '../utils/formatDisplayValue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BudgetAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getBudgetAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching budget analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  if (!analytics || !analytics.budgets || analytics.budgets.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 text-center">
        <p className="text-slate-400">No budget data available. Create budgets to see analytics.</p>
      </div>
    );
  }

  const chartData = {
    labels: analytics.budgets.map(b => b.category),
    datasets: [
      {
        label: 'Budget',
        data: analytics.budgets.map(b => b.budget),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Spent',
        data: analytics.budgets.map(b => b.spent),
        backgroundColor: analytics.budgets.map(b => 
          b.status === 'exceeded' ? 'rgba(239, 68, 68, 0.8)' :
          b.status === 'warning' ? 'rgba(251, 191, 36, 0.8)' :
          'rgba(34, 197, 94, 0.8)'
        ),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-white">
            {formatExpense(analytics.totalBudget || 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">
            {formatExpense(analytics.totalSpent || 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Utilization</p>
          <p className={`text-2xl font-bold ${
            analytics.utilization >= 100 ? 'text-red-400' :
            analytics.utilization >= 90 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {analytics.utilization.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Budget vs Actual</h3>
        <div className="h-80">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: '#94a3b8' },
                },
              },
              scales: {
                y: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                },
                x: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Budget Details */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Budget Details</h3>
        <div className="space-y-3">
          {analytics.budgets.map((budget, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{budget.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  budget.status === 'exceeded' ? 'bg-red-500/20 text-red-400' :
                  budget.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  budget.status === 'moderate' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {budget.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Budget: {formatExpense(budget.budget)}</span>
                <span className="text-slate-400">Spent: {formatExpense(budget.spent)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    budget.utilization >= 100 ? 'bg-red-500' :
                    budget.utilization >= 90 ? 'bg-yellow-500' :
                    budget.utilization >= 75 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, budget.utilization)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{budget.utilization.toFixed(1)}% used</span>
                <span>
                  {budget.remaining >= 0
                    ? `${formatExpense(budget.remaining)} remaining`
                    : `${formatExpense(Math.abs(budget.remaining))} over budget`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {analytics.overBudget && analytics.overBudget.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/30 bg-red-500/10">
          <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Over Budget</h3>
          <div className="space-y-2">
            {analytics.overBudget.map((budget, index) => (
              <div key={index} className="text-sm text-slate-300">
                <span className="font-semibold">{budget.category}</span>: 
                {' '}Exceeded by {formatExpense(Math.abs(budget.remaining))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAnalytics;

