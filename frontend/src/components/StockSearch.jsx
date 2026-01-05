import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StockSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Popular Indian stocks
  const popularStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'ITC.NS', name: 'ITC Limited' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
  ];

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Try to fetch the stock directly
      const symbol = query.toUpperCase().trim();
      // Add .NS for Indian stocks if not present
      const normalizedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
      
      const response = await marketAPI.getStock(normalizedSymbol);
      if (response.data && !response.data.unavailable) {
        setSearchResults([{
          symbol: response.data.symbol,
          name: response.data.name || symbol,
          price: response.data.price,
          change: response.data.change,
          changePercent: response.data.changePercent,
        }]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleStockClick = (symbol) => {
    navigate(`/stocks/${symbol}`);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Search Stocks</h2>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by symbol (e.g., RELIANCE.NS, TCS.NS, AAPL)"
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleStockClick(stock.symbol)}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-teal-500 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{stock.symbol}</p>
                    <p className="text-slate-400 text-sm">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₹{stock.price?.toFixed(2) || 'N/A'}</p>
                    <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Stocks */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Popular Indian Stocks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {popularStocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => handleStockClick(stock.symbol)}
              className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-teal-500 cursor-pointer transition-colors"
            >
              <p className="text-white font-medium text-sm">{stock.symbol}</p>
              <p className="text-slate-400 text-xs">{stock.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;

