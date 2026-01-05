import { formatIncome } from '../utils/formatDisplayValue';

const PortfolioOverview = ({ portfolio, onAddHolding }) => {
  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">No portfolio data available</p>
        <button
          onClick={() => onAddHolding(null)}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          Add Your First Holding
        </button>
      </div>
    );
  }

  const {
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalProfitLossPercent,
    bestPerformer,
    holdings,
  } = portfolio;

  const isProfit = totalProfitLoss >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Total Invested</p>
          <p className="text-2xl font-bold text-white">{formatIncome(totalInvested)}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Current Value</p>
          <p className="text-2xl font-bold text-white">{formatIncome(totalCurrentValue)}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Total P/L</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatIncome(totalProfitLoss)}
          </p>
          <p className={`text-sm mt-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Holdings</p>
          <p className="text-2xl font-bold text-white">{holdings?.length || 0}</p>
        </div>
      </div>

      {/* Best Performer */}
      {bestPerformer && (
        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-6">
          <p className="text-slate-300 text-sm mb-2">Best Performer</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{bestPerformer.name}</p>
              <p className="text-slate-400 text-sm">{bestPerformer.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                +{bestPerformer.profitLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onAddHolding('stock')}
            className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30"
          >
            + Add Stock
          </button>
          <button
            onClick={() => onAddHolding('mf')}
            className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30"
          >
            + Add Mutual Fund
          </button>
          <button
            onClick={() => onAddHolding('crypto')}
            className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30"
          >
            + Add Crypto
          </button>
          <button
            onClick={() => onAddHolding('gold')}
            className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30"
          >
            + Add Gold
          </button>
          <button
            onClick={() => onAddHolding('silver')}
            className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30"
          >
            + Add Silver
          </button>
        </div>
      </div>

      {/* Recent Holdings */}
      {holdings && holdings.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Holdings</h3>
          <div className="space-y-3">
            {holdings.slice(0, 5).map((holding) => (
              <div
                key={holding._id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{holding.name}</p>
                  <p className="text-slate-400 text-sm">{holding.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatIncome(holding.currentValue)}</p>
                  <p
                    className={`text-sm ${
                      holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {holding.profitLoss >= 0 ? '+' : ''}
                    {holding.profitLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioOverview;

