import { useState, useEffect } from 'react';
import { dashboardAPI, expenseAPI, incomeAPI, transactionAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import { useExpenses } from '../contexts/ExpenseContext';
import { useCards } from '../contexts/CardsContext';
import { DashboardIcon, ExpensesIcon, IncomeIcon, BudgetsIcon, GoalsIcon, FoodIcon, TravelIcon, MovieIcon, ClothesIcon, ShoppingIcon } from '../components/Icons';
import Logo from '../components/Logo';
import GuidedCoach from '../components/GuidedCoach';
import Button from '../components/ui/Button';
import AddCardModal from '../components/AddCardModal';
import { formatIncome, formatExpense } from '../utils/formatDisplayValue';

const Dashboard = () => {
  const { expenses, refreshTrigger, fetchExpenses } = useExpenses();
  const [dashboardData, setDashboardData] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState('month'); // month, week, year
  const [syncStatus, setSyncStatus] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { cards, addCard } = useCards();
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Fetch expenses from context on mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Refetch dashboard data when expenses change (via refreshTrigger) or filters change
  useEffect(() => {
    fetchDashboard();
    fetchIncomes();
    fetchSyncStatus();
  }, [selectedMonth, selectedYear, timeRange, refreshTrigger]);

  // Fetch recent transactions for Transaction History section
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await transactionAPI.getAll();
        const transactions = response.data || [];
        // Get last 5 transactions
        setRecentTransactions(transactions.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setRecentTransactions([]);
      }
    };
    fetchRecentTransactions();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const res = await transactionAPI.getSyncStatus();
      setSyncStatus(res.data);
    } catch (error) {
      // Silently fail - not critical
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard({
        month: selectedMonth,
        year: selectedYear,
      });
      setDashboardData(response.data || {});
    } catch (error) {
      console.error('Dashboard error:', error);
      setDashboardData({}); // Set empty object on error to prevent blank screen
    } finally {
      setLoading(false);
    }
  };

  // Expenses are now managed by ExpenseContext - no local fetch needed

  const fetchIncomes = async () => {
    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      setIncomes([]); // Set to empty array on error
    }
  };

  // Safe data access - ensure arrays exist (moved before calculations)
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  // Calculate category breakdown
  const categoryBreakdown = safeExpenses.reduce((acc, expense) => {
    const cat = expense.category || 'Others';
    acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
  })).sort((a, b) => b.amount - a.amount);

  // Calculate monthly spending - Proper monthly comparison
  const monthlyData = safeExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthLabel, amount: 0, key: monthKey };
    }
    acc[monthKey].amount += parseFloat(expense.amount || 0);
    return acc;
  }, {});

  // Get last 12 months for comparison
  const last12Months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    last12Months.push({
      month: monthLabel,
      amount: monthlyData[monthKey]?.amount || 0,
      key: monthKey
    });
  }

  const monthlyChartData = last12Months.map(item => ({
    month: item.month,
    amount: parseFloat(item.amount.toFixed(2)),
  }));

  // Weekly spending breakdown
  const weeklyData = safeExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const week = `Week ${Math.ceil(date.getDate() / 7)}`;
    acc[week] = (acc[week] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const weeklyChartData = Object.entries(weeklyData).map(([week, amount]) => ({
    week,
    amount: parseFloat(amount.toFixed(2)),
  }));

  // Daily spending trend (last 30 days)
  const dailyData = safeExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[dateStr] = (acc[dateStr] || 0) + parseFloat(expense.amount || 0);
    }
    return acc;
  }, {});

  const dailyChartData = Object.entries(dailyData)
    .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);

  // Calculate financial metrics
  const totalIncome = safeIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
  
  // Average daily spending
  const daysWithExpenses = new Set(safeExpenses.map(e => new Date(e.date).toDateString())).size;
  const avgDailySpending = daysWithExpenses > 0 ? (totalExpenses / daysWithExpenses).toFixed(2) : 0;

  // Spending velocity (expenses per day)
  const firstExpense = safeExpenses.length > 0 ? new Date(Math.min(...safeExpenses.map(e => new Date(e.date)))) : new Date();
  const daysSinceFirst = Math.max(1, Math.ceil((new Date() - firstExpense) / (1000 * 60 * 60 * 24)));
  const spendingVelocity = (totalExpenses / daysSinceFirst).toFixed(2);

  // Generate insights - moved after all calculations
  const insights = (() => {
    const insightsList = [];
    
    if (safeExpenses.length === 0) {
      return ['Add your first expense to see insights about your spending patterns'];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Insight 1: Week-over-week spending comparison
    const thisWeekExpenses = safeExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= oneWeekAgo && expenseDate < today;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const lastWeekExpenses = safeExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= twoWeeksAgo && expenseDate < oneWeekAgo;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    if (lastWeekExpenses > 0 && thisWeekExpenses > 0) {
      const changePercent = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;
      if (Math.abs(changePercent) >= 10) {
        if (changePercent > 0) {
          insightsList.push(`Your spending increased this week by ${Math.abs(changePercent).toFixed(0)}% compared to last week`);
        } else {
          insightsList.push(`Your spending decreased this week by ${Math.abs(changePercent).toFixed(0)}% compared to last week`);
        }
      }
    }

    // Insight 2: Top category analysis
    if (categoryData.length > 0 && totalExpenses > 0) {
      const topCategory = categoryData[0];
      const topCategoryPercent = (topCategory.amount / totalExpenses) * 100;
      if (topCategoryPercent >= 30) {
        insightsList.push(`Most of your spending (${topCategoryPercent.toFixed(0)}%) is on ${topCategory.category}`);
      }
    }

    // Insight 3: Day of week pattern
    const dayOfWeekSpending = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Sun-Sat
    safeExpenses.forEach(expense => {
      const day = new Date(expense.date).getDay();
      dayOfWeekSpending[day] += parseFloat(expense.amount || 0);
    });

    const weekendSpending = dayOfWeekSpending[0] + dayOfWeekSpending[6]; // Sun + Sat
    const weekdaySpending = dayOfWeekSpending[1] + dayOfWeekSpending[2] + dayOfWeekSpending[3] + dayOfWeekSpending[4] + dayOfWeekSpending[5];
    const totalWeekSpending = weekendSpending + weekdaySpending;

    if (totalWeekSpending > 0) {
      const weekendPercent = (weekendSpending / totalWeekSpending) * 100;
      if (weekendPercent >= 40) {
        insightsList.push(`Most of your expenses happen on weekends`);
      } else if (weekendPercent <= 20) {
        insightsList.push(`Most of your expenses happen on weekdays`);
      }
    }

    // Insight 4: Today's spending vs average
    const todayExpenses = safeExpenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.toDateString() === today.toDateString();
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    if (todayExpenses > 0 && parseFloat(avgDailySpending) > 0) {
      const todayVsAvg = (todayExpenses / parseFloat(avgDailySpending)) * 100;
      if (todayVsAvg < 70) {
        insightsList.push(`You spent less than your usual daily average today`);
      } else if (todayVsAvg > 130) {
        insightsList.push(`You spent more than your usual daily average today`);
      }
    }

    // If we don't have enough insights, add general ones
    if (insightsList.length === 0) {
      if (categoryData.length > 0) {
        insightsList.push(`Your top spending category is ${categoryData[0].category}`);
      }
      if (parseFloat(avgDailySpending) > 0) {
        insightsList.push(`Your average daily spending is ${formatExpense(avgDailySpending)}`);
      }
    }

    // Return 2-3 insights
    return insightsList.slice(0, 3);
  })();

  // Calculate Stash Score for Guided Coach (simplified)
  const calculateStashScore = () => {
    if (safeExpenses.length === 0) return 50;
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalIncome = safeIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
    let score = 50;
    if (savingsRate >= 30) score += 40;
    else if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 0) score += 10;
    else score -= 20;
    if (balance > 0) score += 10;
    else if (balance < 0) score -= 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const stashScore = calculateStashScore();

  // Income vs Expenses trend - Last 12 months (moved before getChartExplanations)
  const incomeExpenseTrend = {};
  
  safeExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!incomeExpenseTrend[monthKey]) {
      incomeExpenseTrend[monthKey] = { income: 0, expenses: 0, month: monthLabel, key: monthKey };
    }
    incomeExpenseTrend[monthKey].expenses += parseFloat(expense.amount || 0);
  });

  safeIncomes.forEach(income => {
    const date = new Date(income.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!incomeExpenseTrend[monthKey]) {
      incomeExpenseTrend[monthKey] = { income: 0, expenses: 0, month: monthLabel, key: monthKey };
    }
    incomeExpenseTrend[monthKey].income += parseFloat(income.amount || 0);
  });

  // Get last 12 months for trend
  const trend12Months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    trend12Months.push({
      month: monthLabel,
      income: incomeExpenseTrend[monthKey]?.income || 0,
      expenses: incomeExpenseTrend[monthKey]?.expenses || 0,
      key: monthKey
    });
  }

  const trendData = trend12Months.map(item => ({
    month: item.month,
    income: parseFloat(item.income.toFixed(2)),
    expenses: parseFloat(item.expenses.toFixed(2)),
  }));

  // Generate chart explanations
  const getChartExplanations = () => {
    const explanations = {};

    // Income vs Expenses explanation
    if (trendData.length >= 2) {
      const latest = trendData[trendData.length - 1];
      const previous = trendData[trendData.length - 2];
      const incomeChange = latest.income > 0 && previous.income > 0 
        ? ((latest.income - previous.income) / previous.income) * 100 
        : 0;
      const expenseChange = latest.expenses > 0 && previous.expenses > 0
        ? ((latest.expenses - previous.expenses) / previous.expenses) * 100
        : 0;
      
      if (Math.abs(expenseChange) < 5 && Math.abs(incomeChange) < 5) {
        explanations.incomeVsExpenses = "Your income and expenses have been relatively stable recently.";
      } else if (expenseChange > 10) {
        explanations.incomeVsExpenses = "Your expenses increased this month compared to last month.";
      } else if (expenseChange < -10) {
        explanations.incomeVsExpenses = "Your expenses decreased this month, which is great for savings.";
      } else {
        explanations.incomeVsExpenses = "Your income and expenses are tracking well together.";
      }
    } else {
      explanations.incomeVsExpenses = "Keep tracking to see income and expense trends over time.";
    }

    // Category Breakdown explanation
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const topPercent = (topCategory.amount / totalExpenses) * 100;
      if (topPercent >= 40) {
        explanations.categoryBreakdown = `${topCategory.category} spending is your largest category at ${topPercent.toFixed(0)}% of total expenses.`;
      } else if (categoryData.length <= 3) {
        explanations.categoryBreakdown = "Your spending is spread across a few main categories.";
      } else {
        explanations.categoryBreakdown = "Your spending is well-distributed across multiple categories.";
      }
    } else {
      explanations.categoryBreakdown = "Add expenses to see your category breakdown.";
    }

    // Monthly Spending explanation
    if (monthlyChartData.length >= 2) {
      const latest = monthlyChartData[monthlyChartData.length - 1];
      const previous = monthlyChartData[monthlyChartData.length - 2];
      if (previous.amount > 0) {
        const change = ((latest.amount - previous.amount) / previous.amount) * 100;
        if (Math.abs(change) < 5) {
          explanations.monthlySpending = "This month's spending is similar to last month, showing consistency.";
        } else if (change > 0) {
          explanations.monthlySpending = `This month's spending is ${change.toFixed(0)}% higher than last month.`;
        } else {
          explanations.monthlySpending = `This month's spending is ${Math.abs(change).toFixed(0)}% lower than last month.`;
        }
      } else {
        explanations.monthlySpending = "Your monthly spending pattern is developing.";
      }
    } else {
      explanations.monthlySpending = "Track expenses over multiple months to see spending trends.";
    }

    // Daily Spending Trend explanation
    if (dailyChartData.length >= 7) {
      const recent7Days = dailyChartData.slice(-7);
      const previous7Days = dailyChartData.slice(-14, -7);
      const recentAvg = recent7Days.reduce((sum, d) => sum + d.amount, 0) / 7;
      const previousAvg = previous7Days.length > 0 
        ? previous7Days.reduce((sum, d) => sum + d.amount, 0) / previous7Days.length 
        : 0;
      
      if (previousAvg > 0) {
        const change = ((recentAvg - previousAvg) / previousAvg) * 100;
        if (Math.abs(change) < 10) {
          explanations.dailyTrend = "Your daily spending has been relatively stable over the past week.";
        } else if (change > 0) {
          explanations.dailyTrend = `Your daily spending increased by ${change.toFixed(0)}% compared to the previous week.`;
        } else {
          explanations.dailyTrend = `Your daily spending decreased by ${Math.abs(change).toFixed(0)}% compared to the previous week.`;
        }
      } else {
        explanations.dailyTrend = "Your daily spending pattern is developing as you track more expenses.";
      }
    } else {
      explanations.dailyTrend = "Keep tracking daily expenses to see spending patterns emerge.";
    }

    return explanations;
  };

  const chartExplanations = getChartExplanations();

  // Top spending categories
  const topCategories = categoryData.slice(0, 5);

  // Category icons mapping
  const categoryIcons = {
    'Food': <FoodIcon className="w-6 h-6" />,
    'Travel': <TravelIcon className="w-6 h-6" />,
    'Movie': <MovieIcon className="w-6 h-6" />,
    'Clothes': <ClothesIcon className="w-6 h-6" />,
    'Shopping': <ShoppingIcon className="w-6 h-6" />,
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!dashboardData && (
        <div className="text-center py-12 mb-8">
          <Logo size="xl" showText={true} className="justify-center mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Stash</h2>
          <p className="text-gray-400">Start adding expenses and income to see your dashboard</p>
        </div>
      )}
      {/* Sync Status Banner */}
      {syncStatus?.connected && (
        <div className="mb-6 glass-card rounded-xl p-5 border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-4">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
              <div>
                <p className="text-cyan-400 font-semibold text-sm tracking-tight">
                  Auto-Sync Active
                </p>
                <p className="text-slate-400 text-xs font-normal mt-0.5">
                  {syncStatus.email} • Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              Manage Settings
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-400 text-lg font-normal">Your financial overview at a glance</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-normal focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all backdrop-blur-sm"
            >
              <option value="month">Monthly</option>
              <option value="week">Weekly</option>
              <option value="year">Yearly</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-normal focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all backdrop-blur-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-normal focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all backdrop-blur-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Cards</h2>
            <p className="text-slate-400 text-sm">Your saved payment cards</p>
          </div>
          <div className="flex gap-2">
            {cards.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/cards'}>
                View All
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowAddCardModal(true)}>
              ➕ Add Card
            </Button>
          </div>
        </div>
        
        {cards.length === 0 ? (
          <div className="glass-card rounded-xl p-8 border border-white/10 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm mb-4">No cards added yet</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddCardModal(true)}
              >
                ➕ Add Card
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.slice(0, 3).map((card) => (
              <div
                key={card.id}
                className="glass-card rounded-xl p-5 border border-white/10 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  card.type === 'Credit' 
                    ? 'from-blue-500/20 to-purple-500/20' 
                    : 'from-green-500/20 to-cyan-500/20'
                } opacity-50`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      card.type === 'Credit'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {card.type}
                    </span>
                    <span className="text-xs text-slate-400">{card.bankName}</span>
                  </div>
                  <p className="text-lg font-mono font-semibold text-white mb-4 tracking-wider">
                    •••• •••• •••• {card.last4Digits}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Expires</p>
                      <p className="text-sm font-medium text-white">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAdd={(cardData) => {
          addCard(cardData);
          toast.success('Card added successfully');
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <IncomeIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Income</h3>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1 tracking-tight">{formatIncome(totalIncome)}</p>
              <p className="text-xs text-slate-500 font-normal">{incomes.length} entries</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <ExpensesIcon className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Expenses</h3>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1 tracking-tight">{formatExpense(totalExpenses)}</p>
              <p className="text-xs text-slate-500 font-normal">{expenses.length} entries</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <DashboardIcon className={`w-5 h-5 ${balance >= 0 ? 'text-purple-400' : 'text-red-400'}`} />
              </div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Balance</h3>
            </div>
            <div>
              <p className={`text-4xl font-bold mb-1 tracking-tight ${balance >= 0 ? 'text-gradient-blue-purple' : 'text-red-400'}`}>
                {formatIncome(balance)}
              </p>
              <p className="text-xs text-slate-500 font-normal">{balance >= 0 ? 'Positive' : 'Negative'} balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Metrics */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Financial Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="inline-block relative w-28 h-28 mb-4">
              <svg className="transform -rotate-90 w-28 h-28">
                <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(Math.min(Math.max(savingsRate, 0), 100) * 3.02)} 302`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{savingsRate}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-normal">Savings Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400 mb-2 tracking-tight">{formatExpense(avgDailySpending)}</p>
            <p className="text-sm text-slate-400 font-normal">Avg Daily Spending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400 mb-2 tracking-tight">{formatExpense(spendingVelocity)}</p>
            <p className="text-sm text-slate-400 font-normal">Spending Velocity</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-400 mb-2 tracking-tight">{expenses.length}</p>
            <p className="text-sm text-slate-400 font-normal">Transactions</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Trend */}
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-3">
              <DashboardIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Income vs Expenses</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis 
                stroke="#9ca3af" 
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value, name) => {
                  if (name === 'expenses') {
                    return [`₹${(value / 100000).toFixed(2)}L (Expenditure)`, 'Expenditure'];
                  }
                  return [`₹${value.toFixed(2)}`, name];
                }}
              />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          {chartExplanations.incomeVsExpenses && (
            <p className="text-sm text-slate-400 font-normal mt-4 text-center">
              {chartExplanations.incomeVsExpenses}
            </p>
          )}
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mr-3">
              <ShoppingIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Category Breakdown</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
          {categoryData.length > 0 && chartExplanations.categoryBreakdown && (
            <p className="text-sm text-slate-400 font-normal mt-4 text-center">
              {chartExplanations.categoryBreakdown}
            </p>
          )}
          {categoryData.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <ShoppingIcon className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-slate-400 text-lg mb-2 font-medium">No expenses yet</p>
              <p className="text-slate-500 text-sm">Add expenses to see category breakdown</p>
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                {['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Others'].map((cat, idx) => (
                  <div key={cat} className="glass-card rounded-xl p-4 border border-white/10 transition-all">
                    <div className="flex items-center justify-center mb-3">
                      {categoryIcons[cat] || <ShoppingIcon className="w-5 h-5 text-slate-500" />}
                    </div>
                    <p className="text-xs text-slate-400 text-center font-normal uppercase tracking-wider">{cat}</p>
                    <p className="text-xs text-slate-500 text-center mt-2 font-normal">₹0.00</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Bar Chart */}
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 mr-3">
              <ExpensesIcon className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Monthly Spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {chartExplanations.monthlySpending && (
            <p className="text-sm text-slate-400 font-normal mt-4 text-center">
              {chartExplanations.monthlySpending}
            </p>
          )}
        </div>

        {/* Daily Spending Trend */}
        <div className="glass-light rounded-xl p-6 shadow-lg border border-slate-700/30">
          <div className="flex items-center mb-4">
            <DashboardIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Daily Spending Trend (Last 30 Days)</h3>
          </div>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
          {dailyChartData.length > 0 && chartExplanations.dailyTrend && (
            <p className="text-sm text-slate-400 font-normal mt-4 text-center">
              {chartExplanations.dailyTrend}
            </p>
          )}
          {dailyChartData.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center px-4 overflow-hidden">
              <DashboardIcon className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-base mb-1">No spending data for last 30 days</p>
              <p className="text-gray-500 text-xs mb-4">Add expenses to see your daily spending trend</p>
              <div className="w-full max-w-full overflow-x-auto">
                <div className="grid grid-cols-7 gap-1.5 min-w-max mx-auto">
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = new Date();
                    day.setDate(day.getDate() - (29 - i));
                    return (
                      <div key={i} className="glass-light rounded p-1.5 border border-gray-700 min-w-[40px]">
                        <p className="text-[10px] text-gray-500 text-center leading-tight">{day.getDate()}</p>
                        <div className="h-6 bg-gray-800 rounded mt-1 flex items-end justify-center">
                          <div className="w-full bg-gray-700 rounded" style={{ height: '0%' }}></div>
                        </div>
                        <p className="text-[9px] text-gray-600 text-center mt-0.5 leading-tight">₹0</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Categories Infographic */}
      <div className="glass-light rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <ShoppingIcon className="w-6 h-6 mr-2 text-blue-400" />
          Top Spending Categories
        </h2>
        <div className="space-y-4">
          {topCategories.map((item, index) => {
            const percentage = (item.amount / totalExpenses) * 100;
            return (
              <div key={item.category} className="flex items-center gap-4">
                <div className="flex items-center gap-3 w-32">
                  <div className="text-gray-400">
                    {categoryIcons[item.category] || <ShoppingIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{item.category}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{percentage.toFixed(1)}%</span>
                    <span className="text-sm font-bold text-white">{formatExpense(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Cards - Like Fold App */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <ShoppingIcon className="w-6 h-6 mr-2 text-blue-400" />
          Spending by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categoryData.slice(0, 10).map((item, index) => (
            <div key={item.category} className="glass-light rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400">
                  {categoryIcons[item.category] || <ShoppingIcon className="w-5 h-5" />}
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-2 font-normal">{item.category}</p>
              <p className="text-xl font-bold text-white mb-3 tracking-tight">{formatExpense(item.amount)}</p>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${categoryData[0] ? (item.amount / categoryData[0].amount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mr-3">
              <BudgetsIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Budgets</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{dashboardData.budgets || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mr-3">
              <GoalsIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Goals</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{dashboardData.activeGoals || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 mr-3">
              <IncomeIcon className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Income Sources</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {new Set(incomes.map(i => i.source)).size}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-3">
              <ExpensesIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Categories</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{categoryData.length}</p>
        </div>
      </div>

      {/* Bank Sync Coming Soon */}
      <div className="glass-card rounded-2xl p-8 mb-8 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <DashboardIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Connect Bank</h3>
              <span className="px-2 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                Coming Soon
              </span>
            </div>
            <p className="text-slate-300 text-base font-normal leading-relaxed">
              Automatically sync your bank transactions and never miss tracking an expense. Get real-time updates and smarter insights.
            </p>
          </div>
          <Button
            onClick={() => {
              const interested = localStorage.getItem('bankSyncInterest');
              if (!interested) {
                localStorage.setItem('bankSyncInterest', 'true');
                toast.success('We\'ll notify you when bank sync is available!');
              } else {
                toast('You\'re already on the waitlist!', { icon: '✅' });
              }
            }}
            variant="secondary"
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50 text-cyan-400"
          >
            Notify Me
          </Button>
        </div>
      </div>

      {/* Insights Summary Card - Moved to bottom */}
      {insights.length > 0 && (
        <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <DashboardIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Insights Summary</h2>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <p className="text-base text-slate-200 font-normal leading-relaxed flex-1">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Recent Transactions</h2>
            <p className="text-slate-400 text-sm">Your latest financial activity</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/transactions'}>
            View All
          </Button>
        </div>
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <p className="text-slate-400 text-sm">No recent transactions</p>
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300 font-normal">
                        {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {transaction.merchant || transaction.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-normal">
                        {transaction.category || 'Uncategorized'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatExpense(Math.abs(transaction.amount || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guided Coach - Full width - Moved to bottom */}
      <div>
        <GuidedCoach expenses={expenses || []} incomes={incomes || []} stashScore={stashScore || 50} />
      </div>
    </div>
  );
};

export default Dashboard;
