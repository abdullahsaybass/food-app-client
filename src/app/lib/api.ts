import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API = axios.create({
  baseURL: 'http://192.168.0.18:5000/api',
  timeout: 15000, // FIX: 15s timeout — prevents infinite hangs on poor Maldives connections
});

// 🔥 FIX: avoid a static/circular import to auth.store (api.ts → auth.store → notification.api/user.api → api.ts).
// auth.store calls registerLogoutHandler(...) once on module init; the interceptor below
// just calls whatever was registered, with zero import-time coupling back to feature stores.
let onUnauthorized: (() => void) | null = null;
export const registerLogoutHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

// 🔥 Attach token automatically
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 FIX: Handle 401 token expiry — redirect to Login when session expires
API.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      // Clear stored token and force logout
      await AsyncStorage.removeItem('token');
      onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);