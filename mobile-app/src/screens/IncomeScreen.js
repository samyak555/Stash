import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { incomeAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const IncomeScreen = () => {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const sources = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Allowance', 'Others'];

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data || []);
    } catch (error) {
      console.error('Error loading income:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await incomeAPI.create(formData);
      Toast.show({ type: 'success', text1: 'Income added' });
      setShowModal(false);
      setFormData({ amount: '', source: 'Salary', date: new Date().toISOString().split('T')[0], note: '' });
      loadIncomes();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to add income' });
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Income</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={incomes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.incomeCard}>
              <View style={styles.incomeHeader}>
                <Text style={styles.incomeSource}>{item.source}</Text>
                <Text style={styles.incomeAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              {item.note && <Text style={styles.incomeNote}>{item.note}</Text>}
              <Text style={styles.incomeDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No income records yet</Text>
            </View>
          }
        />
      </LinearGradient>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Income</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#94a3b8"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Source"
              placeholderTextColor="#94a3b8"
              value={formData.source}
              onChangeText={(text) => setFormData({ ...formData, source: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              placeholderTextColor="#94a3b8"
              value={formData.note}
              onChangeText={(text) => setFormData({ ...formData, note: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  gradient: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  addButton: { backgroundColor: '#14b8a6', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  incomeCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  incomeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  incomeSource: { fontSize: 16, fontWeight: '600', color: '#fff' },
  incomeAmount: { fontSize: 18, fontWeight: 'bold', color: '#34d399' },
  incomeNote: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  incomeDate: { fontSize: 12, color: '#64748b' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  cancelButton: { backgroundColor: '#334155' },
  submitButton: { backgroundColor: '#14b8a6' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default IncomeScreen;

