import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { newsAPI } from '../services/api';

const NewsScreen = () => {
  const [news, setNews] = useState({ all: [], stocks: [], crypto: [], economy: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsAPI.getCategorized();
      setNews(response.data || { all: [], stocks: [], crypto: [], economy: [] });
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const openArticle = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  const tabs = [
    { id: 'all', label: 'Top News' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'economy', label: 'Economy' },
  ];

  const currentNews = news[activeTab] || [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <Text style={styles.title}>Finance News</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={currentNews}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.newsCard}
              onPress={() => openArticle(item.url)}
            >
              <Text style={styles.newsTitle} numberOfLines={3}>
                {item.title}
              </Text>
              <View style={styles.newsFooter}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsTime}>
                  {new Date(item.publishedAt).toLocaleDateString()}
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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  gradient: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  tabsContainer: { marginBottom: 20 },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTab: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  activeTabText: { color: '#fff' },
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

