import { useState, useEffect } from 'react';
import { investAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingDots from '../components/LoadingDots';
import AddHoldingModal from '../components/AddHoldingModal';
import PortfolioOverview from '../components/PortfolioOverview';
import HoldingsList from '../components/HoldingsList';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import LivePrices from '../components/LivePrices';

const Invest = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'live', label: '🔴 Live Prices' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'mf', label: 'Mutual Funds' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'metals', label: 'Gold & Silver' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await investAPI.getPortfolio();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    // Refresh portfolio every 30 seconds for live prices
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddHolding = (assetType) => {
    setSelectedAssetType(assetType);
    setShowAddModal(true);
  };

  const handleHoldingAdded = () => {
    setShowAddModal(false);
    setSelectedAssetType(null);
    fetchPortfolio();
    toast.success('Holding added successfully!');
  };

  const handleHoldingUpdated = () => {
    fetchPortfolio();
    toast.success('Holding updated successfully!');
  };

  const handleHoldingDeleted = () => {
    fetchPortfolio();
    toast.success('Holding deleted successfully!');
  };

  const getHoldingsForTab = () => {
    if (!portfolio || !portfolio.holdings) return [];
    
    switch (activeTab) {
      case 'stocks':
        return portfolio.holdings.filter(h => h.assetType === 'stock');
      case 'mf':
        return portfolio.holdings.filter(h => h.assetType === 'mf');
      case 'crypto':
        return portfolio.holdings.filter(h => h.assetType === 'crypto');
      case 'metals':
        return portfolio.holdings.filter(h => h.assetType === 'gold' || h.assetType === 'silver');
      default:
        return portfolio.holdings;
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Stash Invest</h1>
          <p className="text-slate-400">Track your investments and portfolio performance</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <PortfolioOverview
            portfolio={portfolio}
            onAddHolding={handleAddHolding}
          />
        )}

        {activeTab === 'live' && (
          <LivePrices holdings={portfolio?.holdings || []} />
        )}

        {(activeTab === 'stocks' || activeTab === 'mf' || activeTab === 'crypto' || activeTab === 'metals') && (
          <HoldingsList
            holdings={getHoldingsForTab()}
            assetType={activeTab === 'metals' ? 'metals' : activeTab}
            onAdd={() => handleAddHolding(activeTab === 'metals' ? 'gold' : activeTab)}
            onUpdate={handleHoldingUpdated}
            onDelete={handleHoldingDeleted}
          />
        )}

        {activeTab === 'analytics' && (
          <PortfolioAnalytics portfolio={portfolio} />
        )}

        {/* Add Holding Modal */}
        {showAddModal && (
          <AddHoldingModal
            assetType={selectedAssetType}
            onClose={() => {
              setShowAddModal(false);
              setSelectedAssetType(null);
            }}
            onSuccess={handleHoldingAdded}
          />
        )}

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Stash does not execute investments or provide investment advice.
            All prices are fetched from public third-party APIs and may be delayed or inaccurate.
            This feature is for tracking and informational purposes only and is not regulated by SEBI or any financial authority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invest;

