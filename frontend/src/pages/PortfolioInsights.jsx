import { useState, useEffect } from 'react';
import { portfolioInsightsAPI } from '../services/api';
import LoadingDots from '../components/LoadingDots';
import { formatIncome } from '../utils/formatDisplayValue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PortfolioInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await portfolioInsightsAPI.getInsights();
        setInsights(response.data);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!insights || !insights.insights || insights.insights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio Insights</h1>
          <p className="text-slate-400 mb-8">Descriptive analytics about your financial health</p>
          <div className="glass-card rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-slate-400">No insights available yet. Add some holdings and transactions to see insights.</p>
          </div>
        </div>
      </div>
    );
  }

  const assetAllocationInsight = insights.insights.find(i => i.type === 'asset_allocation');
  const savingsTrendInsight = insights.insights.find(i => i.type === 'savings_trend');
  const expenseIncomeInsight = insights.insights.find(i => i.type === 'expense_income');
  const cryptoVolatilityInsight = insights.insights.find(i => i.type === 'crypto_volatility');
  const goldExposureInsight = insights.insights.find(i => i.type === 'gold_exposure');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio Insights</h1>
          <p className="text-slate-400">Descriptive analytics about your financial health</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          {assetAllocationInsight && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{assetAllocationInsight.title}</h2>
              <p className="text-slate-400 mb-6">{assetAllocationInsight.description}</p>
              {assetAllocationInsight.data && (
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: Object.keys(assetAllocationInsight.data).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
                      datasets: [{
                        data: Object.values(assetAllocationInsight.data).map(v => parseFloat(v)),
                        backgroundColor: [
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(148, 163, 184, 0.8)',
                        ],
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#94a3b8' },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Savings Trend */}
          {savingsTrendInsight && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{savingsTrendInsight.title}</h2>
              <p className="text-slate-400 mb-6">{savingsTrendInsight.description}</p>
              {savingsTrendInsight.data && savingsTrendInsight.data.length > 0 && (
                <div className="h-64">
                  <Line
                    data={{
                      labels: savingsTrendInsight.data.map(d => d.month),
                      datasets: [{
                        label: 'Monthly Savings',
                        data: savingsTrendInsight.data.map(d => d.savings),
                        borderColor: 'rgb(20, 184, 166)',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        fill: true,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
                      plugins: {
                        legend: {
                          labels: { color: '#94a3b8' },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Expense vs Income */}
          {expenseIncomeInsight && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{expenseIncomeInsight.title}</h2>
              <p className="text-slate-400 mb-6">{expenseIncomeInsight.description}</p>
              {expenseIncomeInsight.data && (
                <div className="h-64">
                  <Bar
                    data={{
                      labels: ['Income', 'Expenses'],
                      datasets: [{
                        label: 'Amount',
                        data: [expenseIncomeInsight.data.income, expenseIncomeInsight.data.expenses],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                        ],
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              )}
              {expenseIncomeInsight.data && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Savings Rate</p>
                  <p className="text-2xl font-bold text-teal-400">{expenseIncomeInsight.data.savingsRate}%</p>
                </div>
              )}
            </div>
          )}

          {/* Crypto Volatility */}
          {cryptoVolatilityInsight && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{cryptoVolatilityInsight.title}</h2>
              <p className="text-slate-400 mb-4">{cryptoVolatilityInsight.description}</p>
              {cryptoVolatilityInsight.data && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Volatility Level</span>
                    <span className={`font-semibold ${
                      cryptoVolatilityInsight.data.level === 'high' ? 'text-red-400' :
                      cryptoVolatilityInsight.data.level === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {cryptoVolatilityInsight.data.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Average 24h Change</span>
                    <span className="text-white font-semibold">{cryptoVolatilityInsight.data.averageChange.toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gold Exposure */}
          {goldExposureInsight && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">{goldExposureInsight.title}</h2>
              <p className="text-slate-400 mb-4">{goldExposureInsight.description}</p>
              {goldExposureInsight.data && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Gold Allocation</span>
                    <span className="text-yellow-400 font-bold text-2xl">{goldExposureInsight.data.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Gold Value</span>
                    <span className="text-white font-semibold">{formatIncome(goldExposureInsight.data.amount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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

export default PortfolioInsights;

