import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { newsAPI } from '../services/api';

const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNews();
    // Refresh every 10 minutes
    const interval = setInterval(loadNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
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

  const openArticle = (link) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Error opening URL:', err));
    }
  };

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
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <Text style={styles.title}>Stash News</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        ) : error && news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No news available at the moment</Text>
          </View>
        ) : (
          <FlatList
            data={news.filter(article => article && article.title && article.title.length > 0 && article.link)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.newsCard}
                onPress={() => openArticle(item.link || item.url)}
              >
                <Text style={styles.newsTitle} numberOfLines={3}>
                  {item.title}
                </Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsSource}>{item.source || 'Google News'}</Text>
                  <Text style={styles.newsTime}>
                    {formatTime(item.publishedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No news available</Text>
              </View>
            }
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  gradient: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  loadingContainer: { alignItems: 'center', marginTop: 50 },
  loadingText: { color: '#94a3b8', fontSize: 16 },
  newsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  newsTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  newsSource: { fontSize: 12, color: '#14b8a6' },
  newsTime: { fontSize: 12, color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});

export default NewsScreen;

