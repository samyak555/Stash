import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardAPI, investAPI, newsAPI, analyticsAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [headlines, setHeadlines] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboard, portfolio, news, health] = await Promise.all([
        dashboardAPI.getDashboard().catch(() => ({ data: {} })),
        investAPI.getPortfolioSummary().catch(() => ({ data: null })),
        newsAPI.getHeadlines(3).catch(() => ({ data: [] })),
        analyticsAPI.getFinancialHealth().catch(() => ({ data: null })),
      ]);

      setDashboardData(dashboard.data);
      setPortfolioSummary(portfolio.data);
      setHeadlines(news.data || []);
      setHealthScore(health.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        {/* Financial Health Score */}
        {healthScore && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Financial Health</Text>
            <View style={styles.healthContainer}>
              <Text style={styles.healthScore}>{healthScore.score}</Text>
              <Text style={styles.healthLabel}>out of 100</Text>
            </View>
            <Text style={styles.healthLevel}>
              {healthScore.level?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(dashboardData?.summary?.totalIncome)}
            </Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Total Expenses</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(dashboardData?.summary?.totalExpenses)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text
            style={[
              styles.cardValue,
              {
                color:
                  (dashboardData?.summary?.balance || 0) >= 0
                    ? '#34d399'
                    : '#f87171',
              },
            ]}
          >
            {formatCurrency(dashboardData?.summary?.balance)}
          </Text>
        </View>

        {/* Portfolio Summary */}
        {portfolioSummary && portfolioSummary.holdingCount > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portfolio</Text>
            <View style={styles.portfolioRow}>
              <View>
                <Text style={styles.cardLabel}>Invested</Text>
                <Text style={styles.cardValue}>
                  {formatCurrency(portfolioSummary.totalInvested)}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Current Value</Text>
                <Text style={styles.cardValue}>
                  {formatCurrency(portfolioSummary.totalCurrentValue)}
                </Text>
              </View>
            </View>
            <View style={styles.portfolioRow}>
              <Text style={styles.cardLabel}>P/L</Text>
              <Text
                style={[
                  styles.cardValue,
                  {
                    color:
                      portfolioSummary.totalProfitLoss >= 0
                        ? '#34d399'
                        : '#f87171',
                  },
                ]}
              >
                {portfolioSummary.totalProfitLoss >= 0 ? '+' : ''}
                {formatCurrency(portfolioSummary.totalProfitLoss)}
              </Text>
            </View>
          </View>
        )}

        {/* News Headlines */}
        {headlines.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Finance News</Text>
              <TouchableOpacity onPress={() => navigation.navigate('News')}>
                <Text style={styles.linkText}>View All →</Text>
              </TouchableOpacity>
            </View>
            {headlines.slice(0, 3).map((article, index) => (
              <TouchableOpacity
                key={index}
                style={styles.newsItem}
                onPress={() => {
                  // Open article URL
                }}
              >
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.newsSource}>{article.source}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  healthContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  healthScore: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
  healthLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  healthLevel: {
    fontSize: 16,
    color: '#14b8a6',
    textAlign: 'center',
    marginTop: 8,
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: '#14b8a6',
    fontSize: 14,
  },
  newsItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  newsTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default DashboardScreen;

