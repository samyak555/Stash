import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cryptoAPI } from '../services/api';

const CryptoSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      const response = await cryptoAPI.searchCryptos(query);
      setResults(response.data || []);
    } catch (error) {
      console.error('Error searching cryptos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (cap) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <Text style={styles.title}>Search Cryptocurrencies</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or symbol (e.g., Bitcoin, BTC)"
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => {
                // Navigate to crypto detail or add to watchlist
                navigation.navigate('CryptoDetail', { crypto: item });
              }}
            >
              <View style={styles.resultHeader}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.cryptoImage} />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.cryptoName}>{item.name}</Text>
                  <Text style={styles.cryptoSymbol}>{item.symbol} • Rank #{item.marketCapRank}</Text>
                </View>
                <View style={styles.resultPrice}>
                  <Text style={styles.price}>${item.currentPrice?.toFixed(2) || 'N/A'}</Text>
                  <Text
                    style={[
                      styles.change,
                      item.priceChangePercentage24h >= 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.priceChangePercentage24h >= 0 ? '+' : ''}
                    {item.priceChangePercentage24h?.toFixed(2) || '0.00'}%
                  </Text>
                </View>
              </View>
              <View style={styles.resultDetails}>
                <Text style={styles.detailText}>
                  Market Cap: {formatMarketCap(item.marketCap)}
                </Text>
                <Text style={styles.detailText}>
                  24h High: ${item.high24h?.toFixed(2)} | Low: ${item.low24h?.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            searchQuery.trim().length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : null
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
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: { color: '#94a3b8' },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cryptoImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  resultInfo: { flex: 1 },
  cryptoName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cryptoSymbol: { fontSize: 12, color: '#94a3b8' },
  resultPrice: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  change: { fontSize: 12, fontWeight: '600' },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
  resultDetails: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  detailText: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});

export default CryptoSearchScreen;

