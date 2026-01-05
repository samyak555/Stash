import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { marketAPI, investAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const StockDetailScreen = ({ route, navigation }) => {
  const { symbol } = route.params;
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    loadStockData();
    checkWatchlist();
    const interval = setInterval(loadStockData, 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadStockData = async () => {
    try {
      const response = await marketAPI.getStock(symbol);
      setStockData(response.data);
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    try {
      const response = await investAPI.getWatchlist();
      const watchlist = response.data || [];
      setIsInWatchlist(watchlist.some((w) => w.symbol === symbol.toUpperCase()));
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        // Remove from watchlist logic here
        Toast.show({ type: 'success', text1: 'Removed from watchlist' });
      } else {
        await investAPI.addToWatchlist({ symbol: symbol.toUpperCase(), name: stockData?.name || symbol });
        Toast.show({ type: 'success', text1: 'Added to watchlist' });
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update watchlist' });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!stockData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stock data unavailable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.stockName}>{stockData.name || symbol}</Text>
          <Text style={styles.stockSymbol}>{stockData.symbol}</Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.price}>₹{stockData.price?.toFixed(2) || 'N/A'}</Text>
          <View style={styles.changeContainer}>
            <Text
              style={[
                styles.change,
                { color: stockData.changePercent >= 0 ? '#34d399' : '#f87171' },
              ]}
            >
              {stockData.change >= 0 ? '+' : ''}₹{stockData.change?.toFixed(2) || '0.00'} (
              {stockData.changePercent >= 0 ? '+' : ''}
              {stockData.changePercent?.toFixed(2) || '0.00'}%)
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.watchlistButton} onPress={toggleWatchlist}>
          <Text style={styles.watchlistButtonText}>
            {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Data</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Open</Text>
            <Text style={styles.dataValue}>₹{stockData.open?.toFixed(2) || 'N/A'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>High</Text>
            <Text style={[styles.dataValue, { color: '#34d399' }]}>
              ₹{stockData.high?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Low</Text>
            <Text style={[styles.dataValue, { color: '#f87171' }]}>
              ₹{stockData.low?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Previous Close</Text>
            <Text style={styles.dataValue}>₹{stockData.previousClose?.toFixed(2) || 'N/A'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Volume</Text>
            <Text style={styles.dataValue}>
              {stockData.volume ? (stockData.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
            </Text>
          </View>
        </View>

        {(stockData.marketCap || stockData.peRatio || stockData.eps) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fundamentals</Text>
            {stockData.marketCap && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Market Cap</Text>
                <Text style={styles.dataValue}>
                  ₹{(stockData.marketCap / 10000000).toFixed(2)}Cr
                </Text>
              </View>
            )}
            {stockData.peRatio && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>P/E Ratio</Text>
                <Text style={styles.dataValue}>{stockData.peRatio.toFixed(2)}</Text>
              </View>
            )}
            {stockData.eps && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>EPS</Text>
                <Text style={styles.dataValue}>₹{stockData.eps.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  gradient: { padding: 16 },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 50 },
  errorText: { color: '#f87171', textAlign: 'center', marginTop: 50 },
  header: { marginBottom: 20 },
  stockName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  stockSymbol: { fontSize: 16, color: '#94a3b8' },
  priceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  price: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  changeContainer: { flexDirection: 'row' },
  change: { fontSize: 18, fontWeight: '600' },
  watchlistButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  watchlistButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dataLabel: { fontSize: 14, color: '#94a3b8' },
  dataValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
});

export default StockDetailScreen;

