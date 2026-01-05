import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketAPI, investAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import LoadingDots from '../components/LoadingDots';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedRange, setSelectedRange] = useState('1d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);

  const timeRanges = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: '5y', label: '5Y' },
  ];

  const fetchStockData = async () => {
    try {
      const response = await marketAPI.getStock(symbol);
      if (response.data && !response.data.unavailable) {
        setStockData(response.data);
      } else {
        toast.error('Stock data unavailable');
        navigate('/invest');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to load stock data');
      navigate('/invest');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (range) => {
    try {
      setChartLoading(true);
      const response = await marketAPI.getStockChart(symbol, range);
      if (response.data && response.data.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockData();
      fetchChartData(selectedRange);
      checkWatchlist();
    }
  }, [symbol]);

  const checkWatchlist = async () => {
    try {
      const response = await investAPI.getWatchlist();
      const watchlist = response.data || [];
      const item = watchlist.find(w => w.symbol === symbol.toUpperCase());
      if (item) {
        setIsInWatchlist(true);
        setWatchlistId(item._id);
      } else {
        setIsInWatchlist(false);
        setWatchlistId(null);
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await investAPI.removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
        setWatchlistId(null);
        toast.success('Removed from watchlist');
      } else {
        const response = await investAPI.addToWatchlist({
          symbol: symbol.toUpperCase(),
          name: stockData?.name || symbol,
        });
        setIsInWatchlist(true);
        setWatchlistId(response.data._id);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchChartData(selectedRange);
    }
  }, [selectedRange]);

  // Auto-refresh stock data every 15 seconds
  useEffect(() => {
    if (!symbol) return;
    
    const interval = setInterval(() => {
      fetchStockData();
    }, 15000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!stockData) {
    return null;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(20, 184, 166, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return '₹' + value.toFixed(2);
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
        tension: 0.1,
      },
    },
  };

  const chartLabels = chartData?.data?.map(point => 
    new Date(point.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  ) || [];
  const chartPrices = chartData?.data?.map(point => point.price) || [];

  const chartDataConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Price',
        data: chartPrices,
        borderColor: stockData.changePercent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: stockData.changePercent >= 0 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/invest')}
            className="text-teal-400 hover:text-teal-300 mb-4 flex items-center gap-2"
          >
            ← Back to Invest
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{stockData.name || symbol}</h1>
              <p className="text-slate-400">{stockData.symbol} • {stockData.exchange || 'NSE'}</p>
            </div>
            <button
              onClick={handleWatchlistToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isInWatchlist
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          </div>
        </div>

        {/* Price Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-4xl font-bold text-white mb-2">
                ₹{stockData.price?.toFixed(2) || 'N/A'}
              </p>
              <div className="flex items-center gap-4">
                <p className={`text-lg font-semibold ${stockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockData.change >= 0 ? '+' : ''}₹{stockData.change?.toFixed(2) || '0.00'}
                </p>
                <p className={`text-lg font-semibold ${stockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent?.toFixed(2) || '0.00'}%)
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-slate-400 text-sm">Last updated: {new Date(stockData.lastUpdated).toLocaleTimeString()}</p>
              <p className="text-teal-400 text-sm mt-1">🔴 Live (updates every 15s)</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRange === range.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="h-80">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingDots />
              </div>
            ) : (
              <Line data={chartDataConfig} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Market Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Market Data</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Open</span>
                <span className="text-white font-semibold">₹{stockData.open?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">High</span>
                <span className="text-green-400 font-semibold">₹{stockData.high?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Low</span>
                <span className="text-red-400 font-semibold">₹{stockData.low?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Previous Close</span>
                <span className="text-white font-semibold">₹{stockData.previousClose?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volume</span>
                <span className="text-white font-semibold">
                  {stockData.volume ? (stockData.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Fundamentals</h2>
            <div className="space-y-3">
              {stockData.marketCap && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="text-white font-semibold">
                    ₹{(stockData.marketCap / 10000000).toFixed(2)}Cr
                  </span>
                </div>
              )}
              {stockData.peRatio && (
                <div className="flex justify-between">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="text-white font-semibold">{stockData.peRatio.toFixed(2)}</span>
                </div>
              )}
              {stockData.eps && (
                <div className="flex justify-between">
                  <span className="text-slate-400">EPS</span>
                  <span className="text-white font-semibold">₹{stockData.eps.toFixed(2)}</span>
                </div>
              )}
              {!stockData.marketCap && !stockData.peRatio && !stockData.eps && (
                <p className="text-slate-400 text-sm">Fundamental data not available</p>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Stash provides market data and news for informational purposes only.
            It does not facilitate investments or provide financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;

