import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../../types/user.types';
import {
  getProfileApi,
  updateProfileApi,
  deleteAccountApi,
  updateProfilePictureApi,
  removeProfilePictureApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from '../../profile/api/user.api';

type AddressInput = {
  street: string;
  city: string;
  state: string;
  postalCode: string;   // ✅ new
  country: string;
  landmark?: string;
  label?: string;

};

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  fetchUser: () => Promise<void>;

  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  updateProfilePic: (formData: FormData) => Promise<void>;
  removeProfilePic: () => Promise<void>;                          // ✅ ADD
  addAddress: (data: AddressInput) => Promise<void>;
  updateAddress: (id: string, data: Partial<AddressInput>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;                   // ✅ ADD
  deleteAccount: () => Promise<void>;                             // ✅ ADD
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (token, user) => {
    if (!token) { console.log('❌ Token is undefined'); return; }
    await AsyncStorage.setItem('token', String(token));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = await AsyncStorage.getItem('token');
    set({ token, user: null, isAuthenticated: !!token, loading: false });
  },

  fetchUser: async () => {
    try {
      const res = await getProfileApi();
      set({ user: res.data.user });
    } catch (err) {
      console.log('Fetch user error:', err);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await updateProfileApi(data);
      set({ user: res.user });
    } catch (err) {
      console.log('Update profile error:', err);
      throw err; // ✅ rethrow so screen Alert works
    }
  },

  updateProfilePic: async (formData) => {
    try {
      const res = await updateProfilePictureApi(formData);
      set({ user: res.user });
    } catch (err) {
      console.log('Update pic error:', err);
      throw err;
    }
  },

  // ✅ ADDED
  removeProfilePic: async () => {
    try {
      const res = await removeProfilePictureApi();
      set({ user: res.user });
    } catch (err) {
      console.log('Remove pic error:', err);
      throw err;
    }
  },

  addAddress: async (data) => {
    try {
      const res = await addAddressApi(data);
      set({ user: res.user });
    } catch (err) {
      console.log('Add address error:', err);
      throw err;
    }
  },

  updateAddress: async (id, data) => {
    try {
      const res = await updateAddressApi(id, data);
      set({ user: res.user });
    } catch (err) {
      console.log('Update address error:', err);
      throw err;
    }
  },

  // ✅ ADDED
// auth.store.ts
deleteAddress: async (id) => {
  try {
    const res = await deleteAddressApi(id); // ✅ safe to use now
    set({ user: res.data.user });
  } catch (err) {
    console.log('Delete address error:', err);
    throw err;
  }
},
  // ✅ ADDED
  deleteAccount: async () => {
    try {
      await deleteAccountApi();
      await AsyncStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    } catch (err) {
      console.log('Delete account error:', err);
      throw err;
    }
  },
}));