import { createContext, useContext, useState, useCallback } from 'react';
import { expenseAPI } from '../services/api';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch expenses from API
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getAll();
      // Handle guest mode or network errors gracefully
      if (response?.isGuest || response?.networkError) {
        setExpenses([]);
        return [];
      }
      setExpenses(response.data || []);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setExpenses([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger refresh - increments counter to notify all consumers
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Refetch expenses and trigger refresh
  const refetchExpenses = useCallback(async () => {
    await fetchExpenses();
    triggerRefresh();
  }, [fetchExpenses, triggerRefresh]);

  const value = {
    expenses,
    loading,
    refreshTrigger,
    fetchExpenses,
    refetchExpenses,
    triggerRefresh,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};










