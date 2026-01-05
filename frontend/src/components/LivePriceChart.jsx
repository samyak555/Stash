import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { marketAPI } from '../services/api';

const LivePriceChart = ({ symbol, assetType, currentPrice }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        // Simulate price history (in real app, you'd fetch historical data)
        // For now, we'll create a simple trend based on current price
        const history = [];
        const basePrice = currentPrice || 100;
        const now = Date.now();
        
        // Generate last 24 hours of data points (every hour)
        for (let i = 23; i >= 0; i--) {
          const timestamp = now - (i * 60 * 60 * 1000);
          // Simulate price variation (±5%)
          const variation = (Math.random() - 0.5) * 0.1;
          const price = basePrice * (1 + variation);
          history.push({
            time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(price.toFixed(2)),
          });
        }
        
        setPriceHistory(history);
      } catch (error) {
        console.error('Error fetching price history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentPrice) {
      fetchPriceHistory();
    }
  }, [symbol, currentPrice]);

  if (isLoading || !priceHistory.length) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
        Loading chart...
      </div>
    );
  }

  const chartData = {
    labels: priceHistory.map(h => h.time),
    datasets: [
      {
        label: 'Price',
        data: priceHistory.map(h => h.price),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#cbd5e1',
          font: { size: 10 },
          callback: function(value) {
            return '₹' + value.toFixed(0);
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
          font: { size: 10 },
          maxRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-32">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default LivePriceChart;

