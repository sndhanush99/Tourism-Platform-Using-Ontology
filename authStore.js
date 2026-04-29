import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('vs_user') || 'null'),
  token: localStorage.getItem('vs_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('vs_token', data.token);
      localStorage.setItem('vs_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ error: err.message || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/register', userData);
      localStorage.setItem('vs_token', data.token);
      localStorage.setItem('vs_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ error: err.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('vs_token');
    localStorage.removeItem('vs_user');
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    localStorage.setItem('vs_user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
