import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not already on login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } catch (e) {
        console.error('Error handling 401:', e);
      }
    }
    // Don't reject network errors in production - let components handle them
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network error - backend may be unavailable');
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
  updateProfile: (data) => api.patch('/users/profile', data),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  connectEmail: (data) => api.post('/transactions/connect-email', data),
  disconnectEmail: () => api.post('/transactions/disconnect-email'),
  syncNow: () => api.post('/transactions/sync-now'),
  getSyncStatus: () => api.get('/transactions/sync-status'),
};

export default api;


