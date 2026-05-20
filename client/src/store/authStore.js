import { create } from 'zustand';
import axios from 'axios';

// Create a configured axios instance
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://freelance-marketplace-dk90.onrender.com');

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 invalid signature/token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized or invalid signature detected. Force logging out...');
      sessionStorage.removeItem('user');
      // If we are not on the login page already, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  isLoading: false,
  error: null,
  hasUnreadMessages: localStorage.getItem('hasUnreadMessages') === 'true',

  setUser: (user) => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
    set({ user });
    return user;
  },

  setHasUnreadMessages: (value) => {
    localStorage.setItem('hasUnreadMessages', value);
    set({ hasUnreadMessages: value });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const user = response.data;
      sessionStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const user = response.data;
      sessionStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem('user');
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
