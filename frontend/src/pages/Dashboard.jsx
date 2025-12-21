import { useState, useEffect } from 'react';
import { dashboardAPI, expenseAPI, incomeAPI, transactionAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import { DashboardIcon, ExpensesIcon, IncomeIcon, BudgetsIcon, GoalsIcon, FoodIcon, TravelIcon, MovieIcon, ClothesIcon, ShoppingIcon } from '../components/Icons';
import Logo from '../components/Logo';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState('month'); // month, week, year
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchExpenses();
    fetchIncomes();
    fetchSyncStatus();
  }, [selectedMonth, selectedYear, timeRange]);

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
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const fetchIncomes = async () => {
    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
    }
  };

  // Calculate category breakdown
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'Others';
    acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
  })).sort((a, b) => b.amount - a.amount);

  // Calculate monthly spending - Proper monthly comparison
  const monthlyData = expenses.reduce((acc, expense) => {
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
  const weeklyData = expenses.reduce((acc, expense) => {
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
  const dailyData = expenses.reduce((acc, expense) => {
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
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
  
  // Average daily spending
  const daysWithExpenses = new Set(expenses.map(e => new Date(e.date).toDateString())).size;
  const avgDailySpending = daysWithExpenses > 0 ? (totalExpenses / daysWithExpenses).toFixed(2) : 0;

  // Spending velocity (expenses per day)
  const firstExpense = expenses.length > 0 ? new Date(Math.min(...expenses.map(e => new Date(e.date)))) : new Date();
  const daysSinceFirst = Math.max(1, Math.ceil((new Date() - firstExpense) / (1000 * 60 * 60 * 24)));
  const spendingVelocity = (totalExpenses / daysSinceFirst).toFixed(2);

  // Top spending categories
  const topCategories = categoryData.slice(0, 5);

  // Income vs Expenses trend - Last 12 months
  const incomeExpenseTrend = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!incomeExpenseTrend[monthKey]) {
      incomeExpenseTrend[monthKey] = { income: 0, expenses: 0, month: monthLabel, key: monthKey };
    }
    incomeExpenseTrend[monthKey].expenses += parseFloat(expense.amount || 0);
  });

  incomes.forEach(income => {
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

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Logo size="xl" showText={true} className="justify-center mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Welcome to Stash</h2>
        <p className="text-gray-400">Start adding expenses and income to see your dashboard</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Sync Status Banner */}
      {syncStatus?.connected && (
        <div className="mb-4 glass-light rounded-xl p-4 border border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-green-400 font-semibold text-sm sm:text-base">
                  Auto-Sync Active
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {syncStatus.email} • Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Manage Settings →
            </Link>
          </div>
        </div>
      )}

      {/* Header with Logo */}
      <div className="mb-8">
        <Logo size="large" showText={true} className="mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400 font-medium">Comprehensive overview of your financial activity</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 sm:gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 sm:px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="month">Monthly</option>
              <option value="week">Weekly</option>
              <option value="year">Yearly</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 sm:px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
              className="px-3 sm:px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Health Score Card */}
      <div className="glass-light rounded-xl p-6 mb-8 border border-indigo-500/20 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-block relative w-24 h-24 mb-3">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle cx="48" cy="48" r="40" stroke="#374151" strokeWidth="8" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(Math.min(Math.max(savingsRate, 0), 100) * 2.51)} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{savingsRate}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium">Savings Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400 mb-1">₹{avgDailySpending}</p>
            <p className="text-sm text-slate-400 font-medium">Avg Daily Spending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400 mb-1">₹{spendingVelocity}</p>
            <p className="text-sm text-slate-400 font-medium">Spending Velocity/Day</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400 mb-1">{expenses.length}</p>
            <p className="text-sm text-slate-400 font-medium">Total Transactions</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-light rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <IncomeIcon className="w-5 h-5 text-emerald-400 mr-2" />
                <h3 className="text-slate-300 text-sm font-semibold">Total Income</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-400">₹{totalIncome.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{incomes.length} income entries</p>
            </div>
          </div>
        </div>
        <div className="glass-light rounded-xl p-6 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 shadow-lg hover:shadow-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <ExpensesIcon className="w-5 h-5 text-rose-400 mr-2" />
                <h3 className="text-slate-300 text-sm font-semibold">Total Expenses</h3>
              </div>
              <p className="text-3xl font-bold text-rose-400">₹{totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{expenses.length} expense entries</p>
            </div>
          </div>
        </div>
        <div className="glass-light rounded-xl p-6 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <DashboardIcon className="w-5 h-5 text-indigo-400 mr-2" />
                <h3 className="text-slate-300 text-sm font-semibold">Balance</h3>
              </div>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                ₹{balance.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {balance >= 0 ? 'Positive balance' : 'Negative balance'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Trend */}
        <div className="glass-light rounded-xl p-6 shadow-lg border border-slate-700/30">
          <div className="flex items-center mb-4">
            <DashboardIcon className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Income vs Expenses Trend</h3>
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
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-light rounded-xl p-6 shadow-lg border border-slate-700/30">
          <div className="flex items-center mb-4">
            <ShoppingIcon className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Category Breakdown</h3>
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
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <ShoppingIcon className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-slate-400 text-lg mb-2 font-medium">No expenses yet</p>
              <p className="text-slate-500 text-sm">Add expenses to see category breakdown</p>
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                {['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Others'].map((cat, idx) => (
                  <div key={cat} className="glass-light rounded-lg p-3 border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-center mb-2">
                      {categoryIcons[cat] || <ShoppingIcon className="w-5 h-5 text-slate-500" />}
                    </div>
                    <p className="text-xs text-slate-400 text-center font-medium">{cat}</p>
                    <p className="text-xs text-slate-600 text-center mt-1">₹0.00</p>
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
        <div className="glass-light rounded-xl p-6 shadow-lg border border-slate-700/30">
          <div className="flex items-center mb-4">
            <ExpensesIcon className="w-5 h-5 text-red-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Monthly Spending</h3>
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
          ) : (
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
                    <span className="text-sm font-bold text-white">₹{item.amount.toFixed(2)}</span>
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
              <p className="text-xs text-gray-400 mb-1">{item.category}</p>
              <p className="text-lg font-bold text-white">₹{item.amount.toFixed(2)}</p>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${categoryData[0] ? (item.amount / categoryData[0].amount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-light rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center mb-4">
            <BudgetsIcon className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-bold text-white">Active Budgets</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{dashboardData.budgets || 0}</p>
        </div>
        <div className="glass-light rounded-xl p-6 border border-yellow-500/20">
          <div className="flex items-center mb-4">
            <GoalsIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-bold text-white">Active Goals</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{dashboardData.activeGoals || 0}</p>
        </div>
        <div className="glass-light rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center mb-4">
            <IncomeIcon className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="text-lg font-bold text-white">Income Sources</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {new Set(incomes.map(i => i.source)).size}
          </p>
        </div>
        <div className="glass-light rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center mb-4">
            <ExpensesIcon className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-bold text-white">Categories Used</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{categoryData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
