import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import LoadingDots from '../components/LoadingDots';

const StashNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call simplified endpoint
        const response = await newsAPI.getNews();
        console.log('[STASH NEWS] API response:', response);
        
        // Response should be array directly
        const newsArray = Array.isArray(response?.data) ? response.data : 
                         Array.isArray(response) ? response : [];
        
        console.log(`[STASH NEWS] Received ${newsArray.length} articles`);
        
        if (newsArray.length === 0) {
          setError('No news available at the moment');
        }
        
        setNews(newsArray);
      } catch (error) {
        console.error('[STASH NEWS] Fetch error:', error);
        setError('Unable to load news. Please try again later.');
        setNews([]);
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Stash News</h1>
          <p className="text-slate-400">Stay updated with latest market news and trends</p>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingDots />
          </div>
        ) : error && news.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">No news available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news
              .filter(article => article && article.title && article.title.length > 0 && article.link)
              .map((article, index) => {
                if (!article.title || !article.link) return null;
                
                const timeDisplay = formatTime(article.publishedAt);
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (article.link) {
                        window.open(article.link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer"
                  >
                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                      <span>{article.source || 'Google News'}</span>
                      <span>{timeDisplay}</span>
                    </div>
                  </div>
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

export default StashNews;

