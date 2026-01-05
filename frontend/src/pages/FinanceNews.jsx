import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import LoadingDots from '../components/LoadingDots';

const FinanceNews = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [news, setNews] = useState({
    all: [],
    stocks: [],
    crypto: [],
    economy: [],
  });
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'Top News' },
    { id: 'stocks', label: 'Stock Market' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'economy', label: 'Economy' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getCategorized();
        console.log('News API response:', response);
        
        if (response && response.data) {
          setNews({
            all: response.data.all || [],
            stocks: response.data.stocks || [],
            crypto: response.data.crypto || [],
            economy: response.data.economy || [],
          });
        } else {
          // If no data, set empty arrays
          setNews({
            all: [],
            stocks: [],
            crypto: [],
            economy: [],
          });
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Set empty arrays on error so UI still renders
        setNews({
          all: [],
          stocks: [],
          crypto: [],
          economy: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentNews = news[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Finance News</h1>
          <p className="text-slate-400">Stay updated with latest market news and trends</p>
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

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingDots />
          </div>
        ) : currentNews.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">No news available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNews
              .filter(article => article && article.title && article.title.length > 0)
              .map((article, index) => {
                if (!article.title || !article.url) return null;
                
                let timeDisplay = 'Just now';
                try {
                  timeDisplay = formatTime(article.publishedAt);
                } catch {
                  timeDisplay = 'Recently';
                }
                
                return (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer"
                  >
                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                      <span>{article.source || 'Unknown'}</span>
                      <span>{timeDisplay}</span>
                    </div>
                  </a>
                );
              })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Stash provides market data and news for informational purposes only.
            It does not facilitate investments or provide financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinanceNews;

