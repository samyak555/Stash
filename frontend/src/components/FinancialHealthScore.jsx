import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FinancialHealthScore = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await analyticsAPI.getFinancialHealth();
        setHealth(response.data);
      } catch (error) {
        console.error('Error fetching health score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 65) return 'text-teal-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 35) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLevelColor = (level) => {
    const colors = {
      excellent: 'bg-green-500/20 text-green-400 border-green-500/50',
      good: 'bg-teal-500/20 text-teal-400 border-teal-500/50',
      fair: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      needs_improvement: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      poor: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[health.level] || colors.fair;
  };

  const breakdown = health.breakdown || {};
  const chartData = {
    labels: Object.keys(breakdown).map(key => {
      const labels = {
        savingsRate: 'Savings Rate',
        expenseManagement: 'Expense Management',
        goalProgress: 'Goal Progress',
        investmentDiversification: 'Investment',
        consistency: 'Consistency',
      };
      return labels[key] || key;
    }),
    datasets: [{
      data: Object.values(breakdown).map(b => b.score || 0),
      backgroundColor: [
        'rgba(20, 184, 166, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(148, 163, 184, 0.8)',
      ],
      borderColor: [
        'rgb(20, 184, 166)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(251, 191, 36)',
        'rgb(148, 163, 184)',
      ],
      borderWidth: 2,
    }],
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Financial Health Score</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Score Display */}
        <div className="flex-1 text-center">
          <div className="relative inline-block">
            <div className={`text-7xl font-bold ${getScoreColor(health.score)}`}>
              {health.score}
            </div>
            <div className="text-slate-400 text-sm mt-2">out of 100</div>
          </div>
          <div className={`mt-4 px-4 py-2 rounded-lg border inline-block ${getLevelColor(health.level)}`}>
            {health.level.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="flex-1">
          <div className="h-64">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#94a3b8',
                      font: { size: 11 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const max = breakdown[Object.keys(breakdown)[context.dataIndex]]?.max || 0;
                        return `${label}: ${value}/${max} points`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
          <div className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-sm font-medium ${
                    rec.priority === 'high' ? 'text-red-400' :
                    rec.priority === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'}
                  </span>
                  <p className="text-slate-300 text-sm flex-1">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthScore;

