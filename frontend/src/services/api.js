import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('tenant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);

// Tenant
export const registerShopify = (data) => api.post('/tenants/register', data);
export const getCurrentTenant = () => api.get('/tenants/me');
export const updateTenant = (data) => api.put('/tenants/update', data);

// Shopify
export const syncData = () => api.post('/shopify/sync');

// Analytics
export const getSummary = () => api.get('/analytics/summary');
export const getOrders = (start, end) => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  return api.get(`/analytics/orders?${params}`);
};
export const getTopCustomers = (limit = 5) => api.get(`/analytics/top-customers?limit=${limit}`);
export const getRevenueByMonth = () => api.get('/analytics/revenue-by-month');
export const getEvents = (limit = 50) => api.get(`/analytics/events?limit=${limit}`);

export default api;
