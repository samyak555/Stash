import { useState, useEffect, useCallback } from 'react';
import { cryptoAPI } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LoadingDots from './LoadingDots';
import { formatIncome } from '../utils/formatDisplayValue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoSearch = ({ onSelectCrypto }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      const response = await cryptoAPI.searchCryptos(query);
      setSearchResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching cryptos:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (cap) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(2)}`;
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search cryptocurrencies (e.g., Bitcoin, BTC, Ethereum)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowResults(true);
          }}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <LoadingDots />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          {searchResults.map((crypto) => {
            const chartData = {
              labels: crypto.sparkline?.slice(0, 7).map((_, i) => `Day ${i + 1}`) || [],
              datasets: [{
                label: 'Price',
                data: crypto.sparkline?.slice(0, 7) || [],
                borderColor: crypto.priceChangePercentage24h >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
              }],
            };

            return (
              <div
                key={crypto.id}
                onClick={() => {
                  if (onSelectCrypto) {
                    onSelectCrypto(crypto);
                  }
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="p-4 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {crypto.image && (
                      <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <h4 className="text-white font-semibold">{crypto.name}</h4>
                      <p className="text-slate-400 text-sm">{crypto.symbol} • Rank #{crypto.marketCapRank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${crypto.currentPrice?.toFixed(2) || 'N/A'}</p>
                    <p
                      className={`text-sm ${
                        crypto.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {crypto.priceChangePercentage24h >= 0 ? '+' : ''}
                      {crypto.priceChangePercentage24h?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>
                {crypto.sparkline && crypto.sparkline.length > 0 && (
                  <div className="h-16 mt-2">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { enabled: false },
                        },
                        scales: {
                          x: { display: false },
                          y: { display: false },
                        },
                        elements: {
                          point: { radius: 0 },
                          line: { borderWidth: 1 },
                        },
                      }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-slate-400">Market Cap: </span>
                    <span className="text-white">{formatMarketCap(crypto.marketCap)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">24h High: </span>
                    <span className="text-green-400">${crypto.high24h?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">24h Low: </span>
                    <span className="text-red-400">${crypto.low24h?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default CryptoSearch;

