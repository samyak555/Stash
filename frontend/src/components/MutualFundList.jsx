import { useState, useEffect } from 'react';
import { formatIncome } from '../utils/formatDisplayValue';
import LoadingDots from './LoadingDots';
import MutualFundSearch from './MutualFundSearch';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MutualFundList = () => {
  const [mfs, setMfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMFs();
    const interval = setInterval(fetchMFs, 3600000); // Refresh every hour (NAV updates daily)
    return () => clearInterval(interval);
  }, []);

  const fetchMFs = async () => {
    try {
      const response = await mutualFundAPI.getTopMFs();
      setMfs(response.data || []);
    } catch (error) {
      console.error('Error fetching MFs:', error);
      setMfs([]);
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-2xl font-bold text-white">Indian Mutual Funds</h2>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
          Daily NAV
        </span>
      </div>

      {/* Mutual Fund Search */}
      <MutualFundSearch onSelectMF={(mf) => {
        // Handle MF selection - could navigate to detail page or add to holdings
        console.log('Selected MF:', mf);
      }} />

      <div className="grid grid-cols-1 gap-6">
        {mfs.map((mf) => {
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
              className="glass-card rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{mf.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {mf.fundHouse} • {mf.schemeCategory || mf.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ₹{mf.nav?.toFixed(2) || 'N/A'}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      mf.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {mf.changePercent >= 0 ? '+' : ''}
                    {mf.changePercent?.toFixed(2) || '0.00'}%
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(mf.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* NAV Chart */}
              {mf.chartData && mf.chartData.length > 0 && (
                <div className="h-48 mb-4">
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
                        x: {
                          ticks: { color: '#94a3b8', maxTicksLimit: 6 },
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        },
                        y: {
                          ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                              return '₹' + value.toFixed(2);
                            },
                          },
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        },
                      },
                      elements: {
                        point: { radius: 0, hoverRadius: 4 },
                        line: { borderWidth: 2 },
                      },
                    }}
                  />
                </div>
              )}

              {/* Returns */}
              {mf.returns && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                  {mf.returns['1M'] !== null && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">1 Month</p>
                      <p
                        className={`font-semibold text-sm ${
                          mf.returns['1M'] >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {mf.returns['1M'] >= 0 ? '+' : ''}
                        {mf.returns['1M']?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  )}
                  {mf.returns['3M'] !== null && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">3 Months</p>
                      <p
                        className={`font-semibold text-sm ${
                          mf.returns['3M'] >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {mf.returns['3M'] >= 0 ? '+' : ''}
                        {mf.returns['3M']?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  )}
                  {mf.returns['6M'] !== null && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">6 Months</p>
                      <p
                        className={`font-semibold text-sm ${
                          mf.returns['6M'] >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {mf.returns['6M'] >= 0 ? '+' : ''}
                        {mf.returns['6M']?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  )}
                  {mf.returns['1Y'] !== null && (
                    <div>
                      <p className="text-slate-400 text-xs mb-1">1 Year</p>
                      <p
                        className={`font-semibold text-sm ${
                          mf.returns['1Y'] >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {mf.returns['1Y'] >= 0 ? '+' : ''}
                        {mf.returns['1Y']?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fundamentals */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-2">Fund Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-xs">Scheme Type: </span>
                    <span className="text-white text-xs">{mf.schemeType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Category: </span>
                    <span className="text-white text-xs">{mf.schemeCategory || mf.category}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MutualFundList;

