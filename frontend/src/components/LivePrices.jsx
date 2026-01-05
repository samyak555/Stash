import { useState, useEffect } from 'react';
import { investAPI, marketAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import LivePriceChart from './LivePriceChart';
import toast from 'react-hot-toast';

// Popular assets to show when user has no holdings
const POPULAR_ASSETS = {
  stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
  crypto: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'],
};

const LivePrices = ({ holdings: propsHoldings }) => {
  const [holdings, setHoldings] = useState(propsHoldings || []);
  const [livePrices, setLivePrices] = useState({});
  const [popularPrices, setPopularPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopular, setShowPopular] = useState(false);

  // Fetch holdings if not provided
  useEffect(() => {
    const fetchHoldings = async () => {
      if (propsHoldings) {
        setHoldings(propsHoldings);
        setLoading(false);
        setShowPopular(propsHoldings.length === 0);
        return;
      }

      try {
        const response = await investAPI.getHoldings();
        if (response.data && response.data.length > 0) {
          setHoldings(response.data);
          setShowPopular(false);
        } else {
          setShowPopular(true);
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
        setShowPopular(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [propsHoldings]);

  const fetchPopularPrices = async () => {
    try {
      const prices = {};
      
      // Fetch popular stocks
      for (const symbol of POPULAR_ASSETS.stocks) {
        try {
          const response = await marketAPI.getStock(symbol);
          if (response.data) {
            prices[`stock_${symbol}`] = {
              name: symbol,
              symbol: symbol,
              assetType: 'stock',
              currentPrice: response.data.price,
              change: response.data.change || 0,
              changePercent: response.data.changePercent || 0,
              lastUpdated: response.data.lastUpdated || new Date().toISOString(),
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch ${symbol}:`, error);
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Fetch popular crypto
      for (const symbol of POPULAR_ASSETS.crypto) {
        try {
          const response = await marketAPI.getCrypto(symbol);
          if (response.data) {
            prices[`crypto_${symbol}`] = {
              name: symbol,
              symbol: symbol,
              assetType: 'crypto',
              currentPrice: response.data.price,
              change: response.data.change || 0,
              changePercent: response.data.changePercent || 0,
              lastUpdated: response.data.lastUpdated || new Date().toISOString(),
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch ${symbol}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setPopularPrices(prices);
    } catch (error) {
      console.error('Error fetching popular prices:', error);
    }
  };

  const fetchLivePrices = async () => {
    if (!holdings || holdings.length === 0) {
      // Fetch popular prices if no holdings
      await fetchPopularPrices();
      setLastUpdate(new Date());
      setIsRefreshing(false);
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
    fetchLivePrices();
    // Auto-refresh every 60 seconds (matches stock cache TTL)
    // Refresh every 15 seconds for LIVE prices
    const interval = setInterval(fetchLivePrices, 15000);
    return () => clearInterval(interval);
  }, [holdings]);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderPriceCard = (item, isPopular = false) => {
    const currentPrice = item.currentPrice || 0;
    const change = item.change || 0;
    const changePercent = item.changePercent || 0;
    const isPositive = change >= 0;

    return (
      <div
        key={isPopular ? item.symbol : item._id}
        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-teal-500/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold text-lg">{item.name || item.symbol}</h4>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded animate-pulse">
                🔴 LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-sm">{item.symbol}</p>
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded capitalize">
                {item.assetType}
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
            symbol={item.symbol}
            assetType={item.assetType}
            currentPrice={currentPrice}
          />
        </div>
        {!isPopular && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Quantity: {item.quantity}</span>
            <span>Value: {formatIncome((currentPrice * item.quantity) || 0)}</span>
          </div>
        )}
      </div>
    );
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

  const hasHoldings = holdings && holdings.length > 0;
  const displayItems = hasHoldings ? holdings : Object.values(popularPrices);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {hasHoldings ? 'Live Prices' : 'Popular Assets - Live Prices'}
          </h3>
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

      {!hasHoldings && (
        <div className="mb-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
          <p className="text-teal-400 text-sm">
            💡 <strong>No holdings yet?</strong> Add your investments to track them here, or explore popular assets below.
          </p>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Prices...</h3>
          <p className="text-slate-400">
            Fetching live market data...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => {
            if (hasHoldings) {
              const livePrice = livePrices[item._id];
              return renderPriceCard({
                ...item,
                currentPrice: livePrice?.currentPrice || item.currentPrice || item.buyPrice,
                change: livePrice?.change || 0,
                changePercent: livePrice?.changePercent || 0,
              });
            } else {
              return renderPriceCard(item, true);
            }
          })}
        </div>
      )}
    </div>
  );
};

export default LivePrices;
