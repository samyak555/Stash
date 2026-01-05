import { useState, useEffect } from 'react';
import { investAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddHoldingModal = ({ assetType, holding, onClose, onSuccess }) => {
  const isEdit = !!holding;
  const [formData, setFormData] = useState({
    assetType: assetType || 'stock',
    symbol: holding?.symbol || '',
    name: holding?.name || '',
    quantity: holding?.quantity || '',
    buyPrice: holding?.buyPrice || '',
    buyDate: holding?.buyDate
      ? new Date(holding.buyDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    broker: holding?.broker || '',
  });
  const [loading, setLoading] = useState(false);

  const assetTypeLabels = {
    stock: 'Stock',
    mf: 'Mutual Fund',
    crypto: 'Cryptocurrency',
    gold: 'Gold',
    silver: 'Silver',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
      };

      if (isEdit) {
        await investAPI.updateHolding(holding._id, data);
        toast.success('Holding updated successfully!');
      } else {
        await investAPI.createHolding(data);
        toast.success('Holding added successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving holding:', error);
      toast.error(error.response?.data?.message || 'Failed to save holding');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Holding' : 'Add Holding'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Type */}
          {!assetType && (
            <div>
              <label className="block text-slate-300 text-sm mb-2">Asset Type</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                required
              >
                {Object.entries(assetTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Symbol */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              {formData.assetType === 'mf' ? 'Scheme Code' : 'Symbol'}
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              placeholder={formData.assetType === 'mf' ? 'e.g., 120503' : 'e.g., AAPL, BTC'}
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g., Apple Inc., Bitcoin"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              {formData.assetType === 'gold' || formData.assetType === 'silver'
                ? 'Quantity (oz)'
                : formData.assetType === 'mf'
                ? 'Units'
                : 'Quantity'}
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              step="0.0001"
              min="0"
              required
            />
          </div>

          {/* Buy Price */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Buy Price (per {formData.assetType === 'gold' || formData.assetType === 'silver' ? 'oz' : formData.assetType === 'mf' ? 'unit' : 'share'})
            </label>
            <input
              type="number"
              name="buyPrice"
              value={formData.buyPrice}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Buy Date */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Buy Date</label>
            <input
              type="date"
              name="buyDate"
              value={formData.buyDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Broker */}
          <div>
            <label className="block text-slate-300 text-sm mb-2">Broker (Optional)</label>
            <input
              type="text"
              name="broker"
              value={formData.broker}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g., Zerodha, Coinbase"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoldingModal;

