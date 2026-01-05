import api from '../config/api';

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const dashboardAPI = {
  getDashboard: (params) => api.get('/dashboard', { params }),
};

export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const incomeAPI = {
  getAll: () => api.get('/income'),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
};

export const investAPI = {
  getPortfolio: () => api.get('/invest/portfolio'),
  getPortfolioSummary: () => api.get('/invest/portfolio/summary'),
  getHoldings: () => api.get('/invest/holdings'),
  createHolding: (data) => api.post('/invest/holding', data),
  updateHolding: (id, data) => api.put(`/invest/holding/${id}`, data),
  deleteHolding: (id) => api.delete(`/invest/holding/${id}`),
  getWatchlist: () => api.get('/invest/watchlist'),
  addToWatchlist: (data) => api.post('/invest/watchlist', data),
  removeFromWatchlist: (id) => api.delete(`/invest/watchlist/${id}`),
};

export const marketAPI = {
  getStock: (symbol) => api.get('/market/stock', { params: { symbol } }),
  getStockChart: (symbol, range = '1d') => api.get('/market/stock/chart', { params: { symbol, range } }),
  getCrypto: (symbol) => api.get('/market/crypto', { params: { symbol } }),
  getMetals: () => api.get('/market/metals'),
  getMutualFund: (schemeCode) => api.get('/market/mutual-fund', { params: { schemeCode } }),
};

export const cryptoAPI = {
  getTopCryptos: (limit) => api.get('/crypto/top', { params: { limit } }),
  searchCryptos: (query) => api.get('/crypto/search', { params: { q: query } }),
  getCryptoFundamentals: (coinId) => api.get(`/crypto/fundamentals/${coinId}`),
};

export const mutualFundAPI = {
  getTopMFs: () => api.get('/mutual-funds/top'),
  searchMFs: (query) => api.get('/mutual-funds/search', { params: { q: query } }),
  getMFFundamentals: (schemeCode) => api.get(`/mutual-funds/fundamentals/${schemeCode}`),
};

export const newsAPI = {
  getNews: () => api.get('/news'),
  getCategorized: () => api.get('/news/categorized'),
  getHeadlines: (limit) => api.get('/news/headlines', { params: { limit } }),
};

export const analyticsAPI = {
  getFinancialHealth: () => api.get('/analytics/health'),
  getExpenseAnalytics: (timeRange) => api.get('/analytics/expenses', { params: { timeRange } }),
  getBudgetAnalytics: () => api.get('/analytics/budgets'),
};

