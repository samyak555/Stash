import { useState, useEffect } from 'react';
import { mutualFundAPI } from '../services/api';
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

const MutualFundSearch = ({ onSelectMF }) => {
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
      const response = await mutualFundAPI.searchMFs(query);
      setSearchResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching MFs:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search Mutual Funds (e.g., SBI Bluechip, HDFC Top 100)"
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
          {searchResults.map((mf) => {
            const chartData = {
              labels: mf.chartData?.map((item, index) => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
              }) || [],
              datasets: [{
                label: 'NAV',
                data: mf.chartData?.map(item => item.nav) || [],
                borderColor: mf.changePercent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                backgroundColor: mf.changePercent >= 0 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
              }],
            };

            return (
              <div
                key={mf.schemeCode}
                onClick={() => {
                  if (onSelectMF) {
                    onSelectMF(mf);
                  }
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="p-4 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{mf.name}</h4>
                    <p className="text-slate-400 text-sm">{mf.fundHouse} • {mf.schemeCategory || mf.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-bold">₹{mf.nav?.toFixed(2) || 'N/A'}</p>
                    <p
                      className={`text-sm ${
                        mf.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {mf.changePercent >= 0 ? '+' : ''}
                      {mf.changePercent?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>
                {mf.chartData && mf.chartData.length > 0 && (
                  <div className="h-20 mt-2">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `NAV: ₹${context.parsed.y.toFixed(2)}`;
                              },
                            },
                          },
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
                {mf.returns && (
                  <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                    {mf.returns['1M'] !== null && (
                      <div>
                        <span className="text-slate-400">1M: </span>
                        <span className={mf.returns['1M'] >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {mf.returns['1M'] >= 0 ? '+' : ''}{mf.returns['1M']?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {mf.returns['3M'] !== null && (
                      <div>
                        <span className="text-slate-400">3M: </span>
                        <span className={mf.returns['3M'] >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {mf.returns['3M'] >= 0 ? '+' : ''}{mf.returns['3M']?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {mf.returns['6M'] !== null && (
                      <div>
                        <span className="text-slate-400">6M: </span>
                        <span className={mf.returns['6M'] >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {mf.returns['6M'] >= 0 ? '+' : ''}{mf.returns['6M']?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {mf.returns['1Y'] !== null && (
                      <div>
                        <span className="text-slate-400">1Y: </span>
                        <span className={mf.returns['1Y'] >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {mf.returns['1Y'] >= 0 ? '+' : ''}{mf.returns['1Y']?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
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

export default MutualFundSearch;

