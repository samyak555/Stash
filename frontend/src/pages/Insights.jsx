import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { InsightsIcon } from '../components/Icons';
import Logo from '../components/Logo';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-white">Loading insights...</div>;
  }

  return (
    <div className="px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mr-4">
              <InsightsIcon className="w-7 h-7 text-purple-400" />
            </div>
            AI Insights
          </h1>
          <p className="text-slate-400 text-lg font-normal">Smart financial analysis and recommendations</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-white/10">
        {insights ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Financial Health Score</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(insights.healthScore || 0) * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{insights.healthScore || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <p className="text-slate-300 font-normal">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.insights && insights.insights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {insights.insights.map((insight, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <p className="text-slate-300 font-normal">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <InsightsIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-normal">No insights available yet</p>
            <p className="text-slate-500 text-sm mt-2 font-normal">Add expenses and income to get AI-powered insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
