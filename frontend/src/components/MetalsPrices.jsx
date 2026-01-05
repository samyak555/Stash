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
              <p className="text-4xl font-bold text-yellow-400 mb-3">
                ₹{metals.gold.pricePer10GramINR ? metals.gold.pricePer10GramINR.toFixed(2) : 
                   metals.gold.priceINR ? (metals.gold.priceINR * 10).toFixed(2) : 
                   'Loading...'}
              </p>
              <p className="text-slate-300 text-sm font-semibold mb-2">
                Per 10 grams (INR)
              </p>
              <div className="space-y-1 mt-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  <span className="text-slate-300">Per gram:</span> ₹{metals.gold.priceINR ? metals.gold.priceINR.toFixed(2) : 'N/A'}
                </p>
                <p className="text-slate-400 text-sm">
                  <span className="text-slate-300">Per ounce:</span> ₹{metals.gold.pricePerOunceINR ? metals.gold.pricePerOunceINR.toFixed(2) : 'N/A'}
                </p>
                {metals.gold.usdToInrRate && (
                  <p className="text-slate-500 text-xs mt-2">
                    USD/INR: {metals.gold.usdToInrRate.toFixed(2)}
                  </p>
                )}
              </div>
              {metals.gold.unavailable && (
                <p className="text-yellow-400 text-xs mt-2">⚠️ Using estimated prices</p>
              )}
            </>
          ) : (
            <p className="text-slate-400">Loading prices...</p>
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
              <p className="text-4xl font-bold text-gray-300 mb-3">
                ₹{metals.silver.pricePer10GramINR ? metals.silver.pricePer10GramINR.toFixed(2) : 
                   metals.silver.priceINR ? (metals.silver.priceINR * 10).toFixed(2) : 
                   'Loading...'}
              </p>
              <p className="text-slate-300 text-sm font-semibold mb-2">
                Per 10 grams (INR)
              </p>
              <div className="space-y-1 mt-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  <span className="text-slate-300">Per gram:</span> ₹{metals.silver.priceINR ? metals.silver.priceINR.toFixed(2) : 'N/A'}
                </p>
                <p className="text-slate-400 text-sm">
                  <span className="text-slate-300">Per ounce:</span> ₹{metals.silver.pricePerOunceINR ? metals.silver.pricePerOunceINR.toFixed(2) : 'N/A'}
                </p>
                {metals.silver.usdToInrRate && (
                  <p className="text-slate-500 text-xs mt-2">
                    USD/INR: {metals.silver.usdToInrRate.toFixed(2)}
                  </p>
                )}
              </div>
              {metals.silver.unavailable && (
                <p className="text-yellow-400 text-xs mt-2">⚠️ Using estimated prices</p>
              )}
            </>
          ) : (
            <p className="text-slate-400">Loading prices...</p>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-slate-700 bg-slate-800/30">
        <p className="text-slate-300 text-sm font-medium mb-1">
          💰 All prices in Indian Rupees (₹)
        </p>
        <p className="text-slate-400 text-xs">
          Prices update every 15 seconds • 
          {metals.gold?.usdToInrRate ? ` USD/INR: ${metals.gold.usdToInrRate.toFixed(2)}` : ' Exchange rate: Loading...'}
        </p>
      </div>
    </div>
  );
};

export default MetalsPrices;

