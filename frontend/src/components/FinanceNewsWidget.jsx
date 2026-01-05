import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../services/api';

const FinanceNewsWidget = () => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const response = await newsAPI.getHeadlines(5);
        setHeadlines(response.data || []);
      } catch (error) {
        console.error('Error fetching headlines:', error);
        setHeadlines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadlines();
    // Refresh every 10 minutes
    const interval = setInterval(fetchHeadlines, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-white/10">
        <h2 className="text-xl font-bold text-text-primary mb-4">Finance News</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-700/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (headlines.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-8 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">Finance News</h2>
        <Link 
          to="/news" 
          className="text-teal-400 text-sm hover:text-teal-300 transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="space-y-4">
        {headlines
          .filter(article => article && article.title && article.title.length > 0 && article.url)
          .map((article, index) => {
            let timeDisplay = 'Just now';
            try {
              timeDisplay = formatTime(article.publishedAt);
            } catch {
              timeDisplay = 'Recently';
            }
            
            return (
              <div
                key={index}
                onClick={() => {
                  if (article.url) {
                    window.open(article.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="block p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/50 hover:border-teal-500/50 cursor-pointer"
              >
                <h3 className="text-white font-medium mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{article.source || 'Unknown'}</span>
                  <span>{timeDisplay}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default FinanceNewsWidget;

