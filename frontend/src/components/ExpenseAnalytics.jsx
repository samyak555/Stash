import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatExpense } from '../utils/formatDisplayValue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getExpenseAnalytics(timeRange);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const categoryChartData = {
    labels: analytics.categoryBreakdown?.slice(0, 5).map(c => c.category) || [],
    datasets: [{
      label: 'Spending',
      data: analytics.categoryBreakdown?.slice(0, 5).map(c => c.total) || [],
      backgroundColor: [
        'rgba(20, 184, 166, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
    }],
  };

  const trendChartData = {
    labels: analytics.monthlyTrend?.map(t => t.month) || [],
    datasets: [
      {
        label: 'Income',
        data: analytics.monthlyTrend?.map(t => t.income) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: analytics.monthlyTrend?.map(t => t.expenses) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Savings',
        data: analytics.monthlyTrend?.map(t => t.savings) || [],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['week', 'month', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-teal-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Spending Velocity</p>
          <p className="text-2xl font-bold text-white">
            {formatExpense(analytics.spendingVelocity || 0)}/day
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Avg Transaction</p>
          <p className="text-2xl font-bold text-white">
            {formatExpense(analytics.averageTransaction || 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Peak Spending Day</p>
          <p className="text-2xl font-bold text-white">
            {analytics.peakSpendingDay?.day || 'N/A'}
          </p>
          {analytics.peakSpendingDay && (
            <p className="text-slate-400 text-xs mt-1">
              {formatExpense(analytics.peakSpendingDay.amount)}
            </p>
          )}
        </div>
      </div>

      {/* Monthly Comparison */}
      {analytics.monthlyComparison && (
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Comparison</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">
                {formatExpense(analytics.monthlyComparison.current)}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-semibold ${
                analytics.monthlyComparison.change >= 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {analytics.monthlyComparison.change >= 0 ? '+' : ''}
                {analytics.monthlyComparison.changePercent.toFixed(1)}%
              </p>
              <p className="text-slate-400 text-xs">vs Last Month</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Last Month</p>
              <p className="text-2xl font-bold text-white">
                {formatExpense(analytics.monthlyComparison.previous)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Top Categories</h3>
          <div className="h-64">
            <Bar
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
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
      )}

      {/* Monthly Trend */}
      {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">6-Month Trend</h3>
          <div className="h-64">
            <Line
              data={trendChartData}
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
      )}
    </div>
  );
};

export default ExpenseAnalytics;

