import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { investAPI, marketAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const InvestScreen = ({ navigation }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await investAPI.getPortfolio();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <Text style={styles.title}>Portfolio</Text>

        {portfolio && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Invested</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(portfolio.totalInvested)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Current Value</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(portfolio.totalCurrentValue)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Profit/Loss</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      portfolio.totalProfitLoss >= 0 ? '#34d399' : '#f87171',
                  },
                ]}
              >
                {portfolio.totalProfitLoss >= 0 ? '+' : ''}
                {formatCurrency(portfolio.totalProfitLoss)}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Holdings</Text>
            <FlatList
              data={portfolio.holdings || []}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.holdingCard}
                  onPress={() => {
                    if (item.assetType === 'stock') {
                      navigation.navigate('StockDetail', { symbol: item.symbol });
                    }
                  }}
                >
                  <View style={styles.holdingHeader}>
                    <Text style={styles.holdingName}>{item.name}</Text>
                    <Text style={styles.holdingPrice}>
                      {formatCurrency(item.currentPrice)}
                    </Text>
                  </View>
                  <View style={styles.holdingDetails}>
                    <Text style={styles.holdingDetail}>
                      Qty: {item.quantity} • Buy: {formatCurrency(item.buyPrice)}
                    </Text>
                    <Text
                      style={[
                        styles.holdingPnl,
                        { color: item.profitLoss >= 0 ? '#34d399' : '#f87171' },
                      ]}
                    >
                      {item.profitLoss >= 0 ? '+' : ''}
                      {formatCurrency(item.profitLoss)} (
                      {item.profitLossPercent?.toFixed(2)}%)
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No holdings yet</Text>
                </View>
              }
            />
          </>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  gradient: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 50 },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 8, marginBottom: 16 },
  holdingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  holdingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  holdingName: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
  holdingPrice: { fontSize: 18, fontWeight: 'bold', color: '#14b8a6' },
  holdingDetails: { marginTop: 8 },
  holdingDetail: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  holdingPnl: { fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});

export default InvestScreen;

