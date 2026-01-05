import { useState, useEffect } from 'react';
import { formatIncome } from '../utils/formatDisplayValue';
import LoadingDots from './LoadingDots';
import CryptoSearch from './CryptoSearch';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoList = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCryptos = async () => {
    try {
      const response = await cryptoAPI.getTopCryptos(20);
      setCryptos(response.data || []);
    } catch (error) {
      console.error('Error fetching cryptos:', error);
      setCryptos([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Cryptocurrencies</h2>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">
          🔴 LIVE
        </span>
      </div>

      {/* Crypto Search */}
      <CryptoSearch onSelectCrypto={(crypto) => {
        // Handle crypto selection - could navigate to detail page or add to watchlist
        console.log('Selected crypto:', crypto);
      }} />

      <div className="grid grid-cols-1 gap-4">
        {cryptos.map((crypto) => {
          const chartData = {
            labels: crypto.sparkline?.slice(0, 7).map((_, i) => `Day ${i + 1}`) || [],
            datasets: [{
              label: 'Price',
              data: crypto.sparkline?.slice(0, 7) || [],
              borderColor: crypto.priceChangePercentage24h >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
              backgroundColor: crypto.priceChangePercentage24h >= 0 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.4,
            }],
          };

          return (
            <div
              key={crypto.id}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {crypto.image && (
                    <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-full" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{crypto.name}</h3>
                    <p className="text-slate-400 text-sm">{crypto.symbol} • Rank #{crypto.marketCapRank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    ${crypto.currentPrice?.toFixed(2) || 'N/A'}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      crypto.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {crypto.priceChangePercentage24h >= 0 ? '+' : ''}
                    {crypto.priceChangePercentage24h?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>

              {/* Mini Chart */}
              {crypto.sparkline && crypto.sparkline.length > 0 && (
                <div className="h-24 mb-4">
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
                        line: { borderWidth: 2 },
                      },
                    }}
                  />
                </div>
              )}

              {/* Fundamentals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Market Cap</p>
                  <p className="text-white font-semibold text-sm">
                    {formatMarketCap(crypto.marketCap)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">24h High</p>
                  <p className="text-green-400 font-semibold text-sm">
                    ${crypto.high24h?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">24h Low</p>
                  <p className="text-red-400 font-semibold text-sm">
                    ${crypto.low24h?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Volume</p>
                  <p className="text-white font-semibold text-sm">
                    {formatMarketCap(crypto.totalVolume)}
                  </p>
                </div>
              </div>

              {/* Additional Fundamentals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {crypto.circulatingSupply && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Circulating Supply</p>
                    <p className="text-white font-semibold text-sm">
                      {(crypto.circulatingSupply / 1e9).toFixed(2)}B {crypto.symbol}
                    </p>
                  </div>
                )}
                {crypto.totalSupply && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Total Supply</p>
                    <p className="text-white font-semibold text-sm">
                      {(crypto.totalSupply / 1e9).toFixed(2)}B {crypto.symbol}
                    </p>
                  </div>
                )}
                {crypto.ath && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">All-Time High</p>
                    <p className="text-white font-semibold text-sm">
                      ${crypto.ath?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                )}
                {crypto.priceChangePercentage7d !== undefined && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">7d Change</p>
                    <p
                      className={`font-semibold text-sm ${
                        crypto.priceChangePercentage7d >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {crypto.priceChangePercentage7d >= 0 ? '+' : ''}
                      {crypto.priceChangePercentage7d?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoList;

