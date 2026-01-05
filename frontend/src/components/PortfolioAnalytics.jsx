import { Pie, Bar } from 'react-chartjs-2';
import { formatIncome } from '../utils/formatDisplayValue';

const PortfolioAnalytics = ({ portfolio }) => {
  if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
        <p className="text-slate-400">No data available for analytics</p>
      </div>
    );
  }

  const { assetAllocation, holdings } = portfolio;

  // Asset Allocation Pie Chart
  const allocationLabels = Object.keys(assetAllocation).map((type) => {
    const labels = {
      stock: 'Stocks',
      mf: 'Mutual Funds',
      crypto: 'Crypto',
      gold: 'Gold',
      silver: 'Silver',
    };
    return labels[type] || type;
  });

  const allocationData = Object.values(assetAllocation).map((alloc) => alloc.currentValue);
  const allocationColors = [
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
  ];

  const allocationChartData = {
    labels: allocationLabels,
    datasets: [
      {
        data: allocationData,
        backgroundColor: allocationColors.slice(0, allocationLabels.length),
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  // Profit/Loss Bar Chart
  const profitLossData = holdings.map((h) => ({
    name: h.name,
    profitLoss: h.profitLoss,
    profitLossPercent: h.profitLossPercent,
  }));

  const sortedByPL = [...profitLossData].sort((a, b) => b.profitLoss - a.profitLoss);

  const profitLossChartData = {
    labels: sortedByPL.map((h) => h.name.substring(0, 15)),
    datasets: [
      {
        label: 'Profit/Loss',
        data: sortedByPL.map((h) => h.profitLoss),
        backgroundColor: sortedByPL.map((h) =>
          h.profitLoss >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        ),
        borderColor: sortedByPL.map((h) =>
          h.profitLoss >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          color: '#cbd5e1',
          callback: function (value) {
            return formatIncome(value);
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Asset Allocation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Asset Allocation</h3>
        <div className="h-64">
          <Pie data={allocationChartData} options={chartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(assetAllocation).map(([type, alloc]) => {
            const labels = {
              stock: 'Stocks',
              mf: 'Mutual Funds',
              crypto: 'Crypto',
              gold: 'Gold',
              silver: 'Silver',
            };
            return (
              <div key={type} className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-slate-300 text-sm mb-1">{labels[type] || type}</p>
                <p className="text-white font-bold">{formatIncome(alloc.currentValue)}</p>
                <p className="text-slate-400 text-xs">
                  {alloc.percentage.toFixed(1)}% of portfolio
                </p>
                <p
                  className={`text-xs mt-1 ${
                    alloc.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {alloc.profitLoss >= 0 ? '+' : ''}
                  {alloc.profitLossPercent.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profit/Loss by Asset */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Profit/Loss by Asset</h3>
        <div className="h-64">
          <Bar data={profitLossChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Gainers</h3>
          <div className="space-y-3">
            {[...holdings]
              .sort((a, b) => (b.profitLossPercent || 0) - (a.profitLossPercent || 0))
              .slice(0, 5)
              .map((holding) => (
                <div
                  key={holding._id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{holding.name}</p>
                    <p className="text-slate-400 text-sm">{holding.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">
                      +{holding.profitLossPercent.toFixed(2)}%
                    </p>
                    <p className="text-green-400 text-sm">
                      +{formatIncome(holding.profitLoss)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Losers</h3>
          <div className="space-y-3">
            {[...holdings]
              .sort((a, b) => (a.profitLossPercent || 0) - (b.profitLossPercent || 0))
              .slice(0, 5)
              .map((holding) => (
                <div
                  key={holding._id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{holding.name}</p>
                    <p className="text-slate-400 text-sm">{holding.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">
                      {holding.profitLossPercent.toFixed(2)}%
                    </p>
                    <p className="text-red-400 text-sm">
                      {formatIncome(holding.profitLoss)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;

