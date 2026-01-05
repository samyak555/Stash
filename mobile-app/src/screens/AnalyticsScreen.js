import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { analyticsAPI } from '../services/api';

const AnalyticsScreen = () => {
  const [health, setHealth] = useState(null);
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [healthRes, expenseRes] = await Promise.all([
        analyticsAPI.getFinancialHealth(),
        analyticsAPI.getExpenseAnalytics('month'),
      ]);
      setHealth(healthRes.data);
      setExpenseAnalytics(expenseRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <Text style={styles.title}>Analytics</Text>

        {health && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Financial Health Score</Text>
            <View style={styles.healthContainer}>
              <Text style={styles.healthScore}>{health.score}</Text>
              <Text style={styles.healthLabel}>out of 100</Text>
            </View>
            <Text style={styles.healthLevel}>
              {health.level?.replace('_', ' ').toUpperCase()}
            </Text>
            {health.recommendations && health.recommendations.length > 0 && (
              <View style={styles.recommendations}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {health.recommendations.slice(0, 2).map((rec, index) => (
                  <Text key={index} style={styles.recommendationText}>
                    • {rec.message}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {expenseAnalytics && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spending Velocity</Text>
              <Text style={styles.cardValue}>
                ₹{parseFloat(expenseAnalytics.spendingVelocity || 0).toFixed(2)}/day
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Average Transaction</Text>
              <Text style={styles.cardValue}>
                ₹{parseFloat(expenseAnalytics.averageTransaction || 0).toFixed(2)}
              </Text>
            </View>

            {expenseAnalytics.topCategories && expenseAnalytics.topCategories.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Categories</Text>
                {expenseAnalytics.topCategories.slice(0, 5).map((cat, index) => (
                  <View key={index} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                    <Text style={styles.categoryAmount}>
                      ₹{parseFloat(cat.total).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#14b8a6' },
  healthContainer: { alignItems: 'center', marginVertical: 16 },
  healthScore: { fontSize: 56, fontWeight: 'bold', color: '#14b8a6' },
  healthLabel: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  healthLevel: { fontSize: 16, color: '#14b8a6', textAlign: 'center', marginTop: 8 },
  recommendations: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  recommendationsTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8 },
  recommendationText: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryName: { fontSize: 14, color: '#fff' },
  categoryAmount: { fontSize: 14, fontWeight: '600', color: '#14b8a6' },
});

export default AnalyticsScreen;

