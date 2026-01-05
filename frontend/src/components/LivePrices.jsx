import { useState, useEffect } from 'react';
import { investAPI, marketAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import LivePriceChart from './LivePriceChart';
import toast from 'react-hot-toast';

const LivePrices = ({ holdings: propsHoldings }) => {
  const [holdings, setHoldings] = useState(propsHoldings || []);
  const [livePrices, setLivePrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch holdings if not provided
  useEffect(() => {
    const fetchHoldings = async () => {
      if (propsHoldings) {
        setHoldings(propsHoldings);
        setLoading(false);
        return;
      }

      try {
        const response = await investAPI.getHoldings();
        if (response.data) {
          setHoldings(response.data);
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [propsHoldings]);

  const fetchLivePrices = async () => {
    if (!holdings || holdings.length === 0) {
      setLoading(false);
      return;
    }
    
    setIsRefreshing(true);
    try {
      // Fetch portfolio to get live prices
      const portfolioResponse = await investAPI.getPortfolio();
      
      if (portfolioResponse.data && portfolioResponse.data.holdings) {
        const prices = {};
        
        // Process each holding
        for (const holding of portfolioResponse.data.holdings) {
          try {
            let priceData = null;
            
            // Fetch live price directly from market API
            switch (holding.assetType) {
              case 'stock':
                try {
                  const stockResponse = await marketAPI.getStock(holding.symbol);
                  if (stockResponse.data) {
                    priceData = stockResponse.data;
                  }
                } catch (error) {
                  console.warn(`Failed to fetch stock price for ${holding.symbol}:`, error);
                }
                break;
              
              case 'crypto':
                try {
                  const cryptoResponse = await marketAPI.getCrypto(holding.symbol);
                  if (cryptoResponse.data) {
                    priceData = cryptoResponse.data;
                  }
                } catch (error) {
                  console.warn(`Failed to fetch crypto price for ${holding.symbol}:`, error);
                }
                break;
              
              case 'gold':
              case 'silver':
                try {
                  const metalsResponse = await marketAPI.getMetals();
                  if (metalsResponse.data) {
                    priceData = metalsResponse.data[holding.assetType] || null;
                  }
                } catch (error) {
                  console.warn(`Failed to fetch metal price for ${holding.assetType}:`, error);
                }
                break;
              
              case 'mf':
                try {
                  const mfResponse = await marketAPI.getMutualFund(holding.symbol);
                  if (mfResponse.data) {
                    priceData = { price: mfResponse.data.nav, ...mfResponse.data };
                  }
                } catch (error) {
                  console.warn(`Failed to fetch MF NAV for ${holding.symbol}:`, error);
                }
                break;
            }
            
            // Use price from portfolio if direct API call failed
            const currentPrice = priceData?.price || holding.currentPrice || holding.buyPrice;
            const change = priceData?.change || holding.priceData?.change || 0;
            const changePercent = priceData?.changePercent || holding.priceData?.changePercent || 0;
            
            prices[holding._id] = {
              currentPrice,
              change,
              changePercent,
              lastUpdated: priceData?.lastUpdated || new Date().toISOString(),
              source: priceData?.source || 'portfolio',
            };
          } catch (error) {
            console.error(`Error processing holding ${holding._id}:`, error);
            // Fallback to portfolio data
            prices[holding._id] = {
              currentPrice: holding.currentPrice || holding.buyPrice,
              change: holding.priceData?.change || 0,
              changePercent: holding.priceData?.changePercent || 0,
              lastUpdated: new Date().toISOString(),
              source: 'portfolio',
            };
          }
        }
        
        setLivePrices(prices);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching live prices:', error);
      toast.error('Failed to fetch live prices');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (holdings && holdings.length > 0) {
      fetchLivePrices();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchLivePrices, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [holdings]);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading live prices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-white mb-2">No Holdings Yet</h3>
          <p className="text-slate-400 mb-6">
            Add your first investment to see live prices here
          </p>
          <p className="text-slate-500 text-sm">
            Live prices will automatically update every 30 seconds once you add holdings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Live Prices</h3>
          <p className="text-slate-400 text-sm">
            Last updated: {lastUpdate ? formatTime(lastUpdate) : 'Loading...'}
            {isRefreshing && <span className="ml-2 text-teal-400 animate-pulse">🔄 Refreshing...</span>}
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
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold text-lg">{holding.name}</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded animate-pulse">
                      🔴 LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-400 text-sm">{holding.symbol}</p>
                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded capitalize">
                      {holding.assetType}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white mb-1">{formatIncome(currentPrice)}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(2)}%
                    </span>
                    <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      ({isPositive ? '+' : ''}{formatIncome(change)})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <LivePriceChart
                  symbol={holding.symbol}
                  assetType={holding.assetType}
                  currentPrice={currentPrice}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Quantity: {holding.quantity}</span>
                <span>Value: {formatIncome((currentPrice * holding.quantity) || 0)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LivePrices;
