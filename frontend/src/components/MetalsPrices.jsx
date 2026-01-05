import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import LoadingDots from './LoadingDots';

const MetalsPrices = () => {
  const [metals, setMetals] = useState({ gold: null, silver: null });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchMetals = async () => {
    try {
      const response = await marketAPI.getMetals();
      if (response.data) {
        setMetals({
          gold: response.data.gold || null,
          silver: response.data.silver || null,
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching metals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetals();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchMetals, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gold & Silver Prices</h2>
          {lastUpdate && (
            <p className="text-slate-400 text-sm mt-1">
              Live prices • Last updated: {lastUpdate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          )}
        </div>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">
          🔴 LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Gold</h3>
              <p className="text-slate-400 text-sm">Spot Price</p>
            </div>
            <div className="text-3xl">🥇</div>
          </div>
          {metals.gold ? (
            <>
              <p className="text-3xl font-bold text-yellow-400 mb-2">
                ${metals.gold.price?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-slate-400 text-sm">
                Per ounce • {metals.gold.source || 'metals.live'}
              </p>
              {metals.gold.unavailable && (
                <p className="text-yellow-400 text-xs mt-2">⚠️ Using cached data</p>
              )}
            </>
          ) : (
            <p className="text-slate-400">Price unavailable</p>
          )}
        </div>

        {/* Silver Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Silver</h3>
              <p className="text-slate-400 text-sm">Spot Price</p>
            </div>
            <div className="text-3xl">🥈</div>
          </div>
          {metals.silver ? (
            <>
              <p className="text-3xl font-bold text-gray-300 mb-2">
                ${metals.silver.price?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-slate-400 text-sm">
                Per ounce • {metals.silver.source || 'metals.live'}
              </p>
              {metals.silver.unavailable && (
                <p className="text-yellow-400 text-xs mt-2">⚠️ Using cached data</p>
              )}
            </>
          ) : (
            <p className="text-slate-400">Price unavailable</p>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-slate-700 bg-slate-800/30">
        <p className="text-slate-400 text-xs">
          💡 Prices are in USD per ounce. For Indian prices, multiply by current USD/INR rate.
          Prices update every 15 seconds.
        </p>
      </div>
    </div>
  );
};

export default MetalsPrices;

