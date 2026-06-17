/**
 * user.api.ts
 *
 * API calls for user profile and address management ONLY.
 *
 * Address shape matches the backend model:
 *   type        — enum 'home' | 'work' | 'other'
 *   label       — optional free-text display name
 *   atoll       — required Maldives atoll
 *   island      — required island name
 *   street      — required
 *   zip         — required postal code
 *   location    — optional GPS { latitude, longitude }
 *   locationLabel — optional reverse-geocode string
 */

import { API }        from '../../../app/lib/api';
import AsyncStorage   from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
// 👤 PROFILE
// ─────────────────────────────────────────────

export const getProfileApi = async () => {
  const res = await API.get('/users/me');
  return res.data;
};

export const updateProfileApi = async (data: {
  name?:  string;
  phone?: string;
}) => {
  const res = await API.put('/users/me', data);
  return res.data;
};

export const deleteAccountApi = async () => {
  const res = await API.delete('/users/me');
  return res.data;
};

// ─────────────────────────────────────────────
// 🖼️ PROFILE PICTURE
// ─────────────────────────────────────────────

export const updateProfilePictureApi = async (formData: FormData) => {
  const token = await AsyncStorage.getItem('token');
  const res = await API.put('/users/me/profile-pic', formData, {
    headers: {
      'Content-Type':  'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    transformRequest: (data) => data,
  });
  return res.data;
};

export const removeProfilePictureApi = async () => {
  const res = await API.delete('/users/me/profile-pic');
  return res.data;
};

// ─────────────────────────────────────────────
// 📍 ADDRESSES
// ─────────────────────────────────────────────

export const getAddressesApi = async () => {
  const res = await API.get('/users/me/addresses');
  return res.data;
};

export const addAddressApi = async (data: {
  type:            'home' | 'work' | 'other';
  label?:          string;
  recipientName?:  string;
  recipientPhone?: string;
  street:          string;
  atoll:           string;
  island:          string;
  zip:             string;
  location?: {
    latitude:  number | null;
    longitude: number | null;
  };
  locationLabel?:  string;
  isDefault?:      boolean;
}) => {
  const res = await API.post('/users/me/addresses', data);
  return res.data;
};

export const updateAddressApi = async (
  addressId: string,
  data: Partial<{
    type:           'home' | 'work' | 'other';
    label:          string;
    recipientName:  string;
    recipientPhone: string;
    street:         string;
    atoll:          string;
    island:         string;
    zip:            string;
    location: {
      latitude:  number | null;
      longitude: number | null;
    };
    locationLabel:  string;
    isDefault:      boolean;
  }>,
) => {
  const res = await API.put(`/users/me/addresses/${addressId}`, data);
  return res.data;
};

export const deleteAddressApi = async (addressId: string) => {
  const res = await API.delete(`/users/me/addresses/${addressId}`);
  return res.data;
};

export const setDefaultAddressApi = async (addressId: string) => {
  const res = await API.patch(`/users/me/addresses/${addressId}/default`);
  return res.data;
};

// ─────────────────────────────────────────────
// 🔑 PASSWORD
// ─────────────────────────────────────────────

export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword:     string;
}) => {
  const res = await API.post('/users/change-password', data);
  return res.data;
};