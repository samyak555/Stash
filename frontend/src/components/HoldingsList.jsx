import { useState, useEffect } from 'react';
import { investAPI } from '../services/api';
import { formatIncome } from '../utils/formatDisplayValue';
import toast from 'react-hot-toast';
import AddHoldingModal from './AddHoldingModal';
import LivePriceChart from './LivePriceChart';

const HoldingsList = ({ holdings, assetType, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (!holdings || holdings.length === 0) return;
      
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
      }
    };

    fetchLivePrices();
    // Refresh every 60 seconds (matches stock cache TTL)
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, [holdings]);

  const handleEdit = (holding) => {
    setSelectedHolding(holding);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holding?')) {
      return;
    }

    try {
      await investAPI.deleteHolding(id);
      onDelete();
    } catch (error) {
      console.error('Error deleting holding:', error);
      toast.error('Failed to delete holding');
    }
  };

  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
        <p className="text-slate-400 mb-4">No holdings found</p>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          Add Your First Holding
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white capitalize">
            {assetType === 'metals' ? 'Gold & Silver' : assetType} Holdings
          </h2>
          {lastUpdate && (
            <p className="text-slate-400 text-sm mt-1">
              Live prices • Last updated: {new Date(lastUpdate).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          + Add Holding
        </button>
      </div>

      <div className="space-y-3">
        {holdings.map((holding) => {
          const isProfit = holding.profitLoss >= 0;
          const livePrice = livePrices[holding._id];
          const currentPrice = livePrice?.currentPrice || holding.currentPrice || holding.buyPrice;
          const priceChange = livePrice?.change || 0;
          const priceChangePercent = livePrice?.changePercent || 0;
          const isPriceUp = priceChange >= 0;
          
          return (
            <div
              key={holding._id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{holding.name}</h3>
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                      {holding.symbol}
                    </span>
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded capitalize">
                      {holding.assetType}
                    </span>
                    {livePrice && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded animate-pulse">
                        🔴 LIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Quantity</p>
                      <p className="text-white font-medium">{holding.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Buy Price</p>
                      <p className="text-white font-medium">{formatIncome(holding.buyPrice)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Current Price</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{formatIncome(currentPrice)}</p>
                        {livePrice && (
                          <span className={`text-xs font-medium ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                            {isPriceUp ? '↑' : '↓'} {Math.abs(priceChangePercent).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Current Value</p>
                      <p className="text-white font-medium">{formatIncome(holding.currentValue)}</p>
                    </div>
                  </div>

                  {/* Live Price Chart */}
                  <div className="mt-4">
                    <LivePriceChart
                      symbol={holding.symbol}
                      assetType={holding.assetType}
                      currentPrice={currentPrice}
                    />
                  </div>

                  {holding.broker && (
                    <p className="text-slate-400 text-sm mt-2">Broker: {holding.broker}</p>
                  )}
                </div>

                <div className="ml-6 text-right">
                  <p className={`text-2xl font-bold mb-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{formatIncome(holding.profitLoss)}
                  </p>
                  <p className={`text-lg font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(holding)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(holding._id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedHolding && (
        <AddHoldingModal
          assetType={selectedHolding.assetType}
          holding={selectedHolding}
          onClose={() => {
            setShowEditModal(false);
            setSelectedHolding(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedHolding(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default HoldingsList;

