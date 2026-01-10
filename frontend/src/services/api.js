import axios from 'axios';

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://stash-backend-4wty.onrender.com/api';

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}

// Circuit Breaker Pattern
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN. Service unavailable.');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn('Circuit breaker OPEN - too many failures');
    }
  }
}

// Retry logic with exponential backoff
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const waitTime = delay * Math.pow(2, i);
      console.warn(`Request failed, retrying in ${waitTime}ms... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Create circuit breaker instance
const circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 60s timeout

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  timeoutErrorMessage: 'Request timed out. Please check your connection.',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('isGuest') === 'true';

    // For guest mode, don't send auth token but allow read-only requests
    if (token && !isGuest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add guest mode header for backend to handle gracefully
    if (isGuest) {
      config.headers['X-Guest-Mode'] = 'true';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and network issues with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const originalRequest = error.config;

    // Skip retry if already retried or if it's a non-retryable error
    const shouldRetry =
      !originalRequest._retry &&
      error.code !== 'ERR_CANCELED' &&
      !(error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 408);

    // Retry logic for network errors and timeouts
    if (shouldRetry && (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      error.response?.status === 408 ||
      error.response?.status >= 500
    )) {
      originalRequest._retry = true;

      try {
        // Use circuit breaker and retry
        return await circuitBreaker.execute(() =>
          retryRequest(() => api(originalRequest), 3, 1000)
        );
      } catch (retryError) {
        // If retry fails, handle gracefully
        if (isGuest) {
          return Promise.resolve({ data: null, isGuest: true, networkError: true });
        }
        throw retryError;
      }
    }

    // For guest mode, allow 401/403 errors gracefully (read-only mode)
    if (isGuest && (error.response?.status === 401 || error.response?.status === 403)) {
      console.warn('Guest mode: API request requires authentication');
      return Promise.resolve({ data: null, isGuest: true });
    }

    // Only redirect on 401 if authenticated user and not on login page
    if (error.response?.status === 401 && !isGuest && !window.location.pathname.includes('/login')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } catch (e) {
        console.error('Error handling 401:', e);
      }
    }

    // Handle network errors gracefully
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      console.warn('Network error - backend may be unavailable:', error.message);
      if (isGuest) {
        return Promise.resolve({ data: null, isGuest: true, networkError: true });
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  googleAuth: (idToken) => api.post('/auth/google', typeof idToken === 'string' ? { idToken } : idToken),
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

export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  addProgress: (id, data) => api.post(`/goals/${id}/progress`, data),
};

export const dashboardAPI = {
  getDashboard: (params) => api.get('/dashboard', { params }),
};

export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
};

export const groupAPI = {
  getAll: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  getById: (id) => api.get(`/groups/${id}`),
  invite: (id, data) => api.post(`/groups/${id}/invite`, data),
  acceptInvitation: (id) => api.post(`/groups/${id}/accept`),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
};

export const onboardingAPI = {
  complete: (data) => api.post('/onboarding', data),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  connectEmail: (data) => api.post('/transactions/connect-email', data),
  disconnectEmail: () => api.post('/transactions/disconnect-email'),
  syncNow: () => api.post('/transactions/sync-now'),
  getSyncStatus: () => api.get('/transactions/sync-status'),
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
  getStocks: (symbols) => api.get('/market/stocks', { params: { symbols } }),
  getStockChart: (symbol, range = '1d') => api.get('/market/stock/chart', { params: { symbol, range } }),
  getCrypto: (symbol) => api.get('/market/crypto', { params: { symbol } }),
  getCryptos: (symbols) => api.get('/market/cryptos', { params: { symbols } }),
  getMetals: () => api.get('/market/metals'),
  getMutualFund: (schemeCode) => api.get('/market/mutual-fund', { params: { schemeCode } }),
  getMutualFunds: (schemeCodes) => api.get('/market/mutual-funds', { params: { schemeCodes } }),
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


export const portfolioInsightsAPI = {
  getInsights: () => api.get('/portfolio-insights'),
};

export const alertsAPI = {
  getAlerts: (options) => api.get('/alerts', { params: options }),
  createAlert: (data) => api.post('/alerts', data),
  markRead: (id) => api.post(`/alerts/${id}/read`),
  markAllRead: () => api.post('/alerts/read-all'),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  checkAlerts: () => api.post('/alerts/check'),
};

export const analyticsAPI = {
  getFinancialHealth: () => api.get('/analytics/health'),
  getExpenseAnalytics: (timeRange) => api.get('/analytics/expenses', { params: { timeRange } }),
  getBudgetAnalytics: () => api.get('/analytics/budgets'),
};

export default api;


