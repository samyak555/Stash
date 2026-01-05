import { useState, useEffect } from 'react';
import { investAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import LivePriceChart from './LivePriceChart';

const LivePrices = ({ holdings }) => {
  const [livePrices, setLivePrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLivePrices = async () => {
    if (!holdings || holdings.length === 0) return;
    
    setIsRefreshing(true);
    try {
      const response = await investAPI.getPortfolio();
      if (response.data && response.data.holdings) {
        const prices = {};
        response.data.holdings.forEach(holding => {
          prices[holding._id] = {
            currentPrice: holding.currentPrice || holding.buyPrice,
            change: holding.priceData?.change || 0,
            changePercent: holding.priceData?.changePercent || 0,
            lastUpdated: holding.priceData?.lastUpdated || new Date().toISOString(),
          };
        });
        setLivePrices(prices);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching live prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, [holdings]);

  if (!holdings || holdings.length === 0) {
    return null;
  }

  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Live Prices</h3>
          <p className="text-slate-400 text-sm">
            Last updated: {lastUpdate ? formatTime(lastUpdate) : 'Loading...'}
            {isRefreshing && <span className="ml-2 text-teal-400">🔄 Refreshing...</span>}
          </p>
        </div>
        <button
          onClick={fetchLivePrices}
          disabled={isRefreshing}
          className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-medium transition-colors border border-teal-500/30 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {holdings.map((holding) => {
          const livePrice = livePrices[holding._id];
          const currentPrice = livePrice?.currentPrice || holding.currentPrice || holding.buyPrice;
          const change = livePrice?.change || 0;
          const changePercent = livePrice?.changePercent || 0;
          const isPositive = change >= 0;

          return (
            <div
              key={holding._id}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white font-bold">{holding.name}</h4>
                  <p className="text-slate-400 text-sm">{holding.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{formatIncome(currentPrice)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(2)}%
                    </span>
                    <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      ({isPositive ? '+' : ''}{formatIncome(change)})
                    </span>
                  </div>
                </div>
              </div>
              <LivePriceChart
                symbol={holding.symbol}
                assetType={holding.assetType}
                currentPrice={currentPrice}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LivePrices;

