import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Address } from '../../../types/user.types';
import { notificationApi } from '../../notification/api/notification.api';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  getProfileApi,
  getAddressesApi,
  updateProfileApi,
  deleteAccountApi,
  updateProfilePictureApi,
  removeProfilePictureApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
} from '../../profile/api/user.api';
import { googleAuthApi } from '../api/auth.api';

type AddressInput = {
  street:          string;
  city:            string;
  state?:          string;
  postalCode?:     string;
  country?:        string;
  type:            'home' | 'work' | 'other';
  label?:          string;
  recipientName?:  string;
  recipientPhone?: string;
  isDefault?:      boolean;
};

interface AuthState {
  token:           string | null;
  user:            User | null;
  isAuthenticated: boolean;
  loading:         boolean;
  showSplash:      boolean;
  addressError:    string | null;

  login:            (token: string, user: User) => Promise<void>;
  loginWithGoogle:  (idToken: string) => Promise<void>;   // ← NEW
  logout:           () => Promise<void>;
  setSplash:        (val: boolean) => void;
  hydrate:          () => Promise<void>;
  fetchUser:        () => Promise<void>;
  fetchAddresses:   () => Promise<void>;
  updateProfile:    (data: { name?: string; phone?: string }) => Promise<void>;
  updateProfilePic: (formData: FormData) => Promise<void>;
  removeProfilePic: () => Promise<void>;
  addAddress:       (data: AddressInput) => Promise<void>;
  updateAddress:    (id: string, data: Partial<AddressInput>) => Promise<void>;
  deleteAddress:    (id: string) => Promise<void>;
  setDefaultAddress:(id: string) => Promise<void>;
  deleteAccount:    () => Promise<void>;
}

// ─── Helper: register push token ─────────────────────────────────────────────
const registerPushToken = async () => {
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await notificationApi.registerDeviceToken(token, platform);
  } catch (err) {
    console.error('Push token registration failed:', err);
  }
};

// ─── Helper: patch user.addresses in state ────────────────────────────────────
const patchAddresses = (
  set: (fn: (s: AuthState) => Partial<AuthState>) => void,
  addresses: Address[],
) =>
  set((s) => ({
    user: s.user ? { ...s.user, addresses } : s.user,
  }));

export const useAuthStore = create<AuthState>((set) => ({
  token:           null,
  user:            null,
  isAuthenticated: false,
  loading:         true,
  showSplash:      false,
  addressError:    null,

  // ── Auth ──────────────────────────────────────────────────────────────────

  login: async (token, user) => {
    if (!token) { console.error('❌ Token is undefined'); return; }
    await AsyncStorage.setItem('token', String(token));
    set({ token, user, isAuthenticated: true, showSplash: true });
    registerPushToken();
  },

  // ── Google Sign-In ────────────────────────────────────────────────────────
  loginWithGoogle: async (idToken) => {
    const res   = await googleAuthApi({ idToken });
    const token = res.data.accessToken;
    const user  = res.data.user;
    if (!token) throw new Error('No token received from Google auth');
    await AsyncStorage.setItem('token', String(token));
    set({ token, user, isAuthenticated: true, showSplash: true });
    registerPushToken();
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, showSplash: true });
  },

  setSplash: (val) => set({ showSplash: val }),

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, loading: false });
        return;
      }
      const res = await getProfileApi();
      set({ token, user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error('Hydrate error:', err);
      set({ token: null, user: null, isAuthenticated: false, loading: false });
    }
  },

  // ── Profile ───────────────────────────────────────────────────────────────

  fetchUser: async () => {
    try {
      const res = await getProfileApi();
      set({ user: res.data.user });
    } catch (err) {
      console.error('Fetch user error:', err);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await updateProfileApi(data);
      set({ user: res.user });
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  },

  updateProfilePic: async (formData) => {
    try {
      const res = await updateProfilePictureApi(formData);
      set({ user: res.user });
    } catch (err) {
      console.error('Update pic error:', err);
      throw err;
    }
  },

  removeProfilePic: async () => {
    try {
      const res = await removeProfilePictureApi();
      set({ user: res.user });
    } catch (err) {
      console.error('Remove pic error:', err);
      throw err;
    }
  },

  // ── Addresses ─────────────────────────────────────────────────────────────

  fetchAddresses: async () => {
    set({ addressError: null });
    try {
      const res = await getAddressesApi();
      const addresses: Address[] = res?.data?.addresses ?? res?.addresses ?? [];
      patchAddresses(set, addresses);
    } catch (err: any) {
      console.error('Fetch addresses error:', err);
      set({ addressError: err?.response?.data?.message ?? err?.message ?? 'Failed to load addresses.' });
    }
  },

  addAddress: async (data) => {
    try {
      const res = await addAddressApi(data as any);
      const addresses: Address[] = res?.data?.addresses ?? res?.addresses ?? [];
      patchAddresses(set, addresses);
    } catch (err) {
      console.error('Add address error:', err);
      throw err;
    }
  },

  updateAddress: async (id, data) => {
    try {
      const res = await updateAddressApi(id, data as any);
      const addresses: Address[] = res?.data?.addresses ?? res?.addresses ?? [];
      patchAddresses(set, addresses);
    } catch (err) {
      console.error('Update address error:', err);
      throw err;
    }
  },

  deleteAddress: async (id) => {
    try {
      const res = await deleteAddressApi(id);
      const addresses: Address[] = res?.data?.addresses ?? res?.addresses ?? [];
      patchAddresses(set, addresses);
    } catch (err) {
      console.error('Delete address error:', err);
      throw err;
    }
  },

  setDefaultAddress: async (id) => {
    try {
      const res = await setDefaultAddressApi(id);
      const addresses: Address[] = res?.data?.addresses ?? res?.addresses ?? [];
      patchAddresses(set, addresses);
    } catch (err) {
      console.error('Set default address error:', err);
      throw err;
    }
  },

  deleteAccount: async () => {
    try {
      await deleteAccountApi();
      await AsyncStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  },
}));