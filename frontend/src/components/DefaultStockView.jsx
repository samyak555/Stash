import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
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

const POPULAR_STOCKS = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
];

const DefaultStockView = () => {
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStocks = async () => {
    try {
      const symbols = POPULAR_STOCKS.join(',');
      const response = await marketAPI.getStocks(symbols);
      if (response.data) {
        setStocks(response.data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchStocks, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchChartData = async (symbol) => {
    try {
      const response = await marketAPI.getStockChart(symbol, '1d');
      if (response.data && response.data.data) {
        return response.data.data.slice(-20); // Last 20 data points for mini chart
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POPULAR_STOCKS.map(symbol => (
          <div key={symbol} className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
            <div className="h-32 bg-slate-700/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {POPULAR_STOCKS.map(symbol => {
        const stock = stocks[symbol];
        if (!stock || stock.unavailable) {
          return (
            <div key={symbol} className="glass-card rounded-2xl p-6 border border-white/10">
              <p className="text-white font-semibold">{symbol}</p>
              <p className="text-slate-400 text-sm mt-2">Price unavailable</p>
            </div>
          );
        }

        return (
          <StockCard
            key={symbol}
            symbol={symbol}
            stock={stock}
            onClick={() => navigate(`/stocks/${symbol}`)}
          />
        );
      })}
    </div>
  );
};

const StockCard = ({ symbol, stock, onClick }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const response = await marketAPI.getStockChart(symbol, '1d');
        if (response.data && response.data.data) {
          const data = response.data.data.slice(-20); // Last 20 data points
          if (data.length > 0) {
            setChartData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching chart:', error);
      }
    };
    loadChart();
  }, [symbol]);

  const chartConfig = chartData ? {
    labels: chartData.map((_, i) => ''),
    datasets: [{
      data: chartData.map(d => d.price),
      borderColor: stock.changePercent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
      backgroundColor: stock.changePercent >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.1,
      pointRadius: 0,
    }],
  } : null;

  return (
    <div
      onClick={onClick}
      className="glass-card rounded-2xl p-6 border border-white/10 hover:border-teal-500 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white font-bold text-lg">{symbol}</p>
          <p className="text-slate-400 text-sm">{stock.name || symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-xl">₹{stock.price?.toFixed(2) || 'N/A'}</p>
          <p className={`text-sm font-semibold ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
          </p>
        </div>
      </div>
      {chartConfig && (
        <div className="h-24 mt-4">
          <Line
            data={chartConfig}
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
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DefaultStockView;

