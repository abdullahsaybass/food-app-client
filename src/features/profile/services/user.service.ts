import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '../../../types/user.types';
import  { getProfileApi,
          updateProfileApi,
          deleteAccountApi,
          updateProfilePictureApi,
          removeProfilePictureApi,
          addAddressApi,
          updateAddressApi,
          } from '../../profile/api/user.api'

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
  addAddress: (data: AddressInput) => Promise<void>;
  updateAddress: (id: string, data: Partial<AddressInput>) => Promise<void>;
}
type AddressInput = {
  street: string;
  city: string;
  state?: string;
  zip?: string;
};
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (token, user) => {
    if (!token) {
      console.log("❌ Token is undefined");
      return;
    }

    await AsyncStorage.setItem('token', String(token));

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    const token = await AsyncStorage.getItem('token');

    set({
      token,
      user: null,
      isAuthenticated: !!token,
      loading: false,
    });
  },
  fetchUser: async () => {
    try {
      const res = await getProfileApi();

      set({ user: res.data.user }); // ✅ FIX

    } catch (err) {
      console.log('Fetch user error:', err);
    }
  },
  updateProfile: async (data: { name?: string; phone?: string }) => {
    try {
      const res = await updateProfileApi(data);
      set({ user: res.user });
    } catch (err) {
      console.log("Update profile error:", err);
    }
  },
  updateProfilePic: async (formData: FormData) => {
    try {
      const res = await updateProfilePictureApi(formData);
      set({ user: res.user });
    } catch (err) {
      console.log("Update pic error:", err);
    }
  },
  addAddress: async (data: AddressInput) => {
    try {
      const res = await addAddressApi(data);
      set({ user: res.user });
    } catch (err) {
      console.log("Add address error:", err);
    }
  },

  updateAddress: async (id: string, data: Partial<AddressInput>) => {
    try {
      const res = await updateAddressApi(id, data);
      set({ user: res.user });
    } catch (err) {
      console.log("Update address error:", err);
    }
  },


}));