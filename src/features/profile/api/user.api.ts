/**
 * user.api.ts
 *
 * API calls for user profile and address management ONLY.
 *
 * REMOVED: getOrderHistoryApi, getOrderByIdApi, cancelOrderApi, reorderApi
 *          → moved to features/order/api/order.api.ts
 *
 * REMOVED: forgotPasswordApi, resetPasswordApi
 *          → they live in features/auth/api/auth.api.ts (auth concern, not user concern)
 *
 * FIXED: addAddressApi used 'zip' — standardised to 'postalCode' everywhere
 *        to match DeliveryAddress / SavedAddress types in order.types.ts.
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
  // Token manually attached because multipart/form-data bypasses
  // the default Authorization interceptor in some RN environments.
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
  street:          string;
  city:            string;
  label?:          string;
  recipientName?:  string;
  recipientPhone?: string;
  state?:          string;
  postalCode?:     string;   // ← was 'zip' — now consistent with order types
  isDefault?:      boolean;
}) => {
  const res = await API.post('/users/me/addresses', data);
  return res.data;
};

export const updateAddressApi = async (
  addressId: string,
  data: Partial<{
    label:          string;
    type:           'home' | 'work' | 'other';
    recipientName:  string;
    recipientPhone: string;
    street:         string;
    city:           string;
    state:          string;
    postalCode:     string;   // ← was 'zip'
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
// Only changePassword lives here — it's an authenticated user action.
// forgotPassword / resetPassword are in auth.api.ts (unauthenticated flows).

export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword:     string;
}) => {
  const res = await API.post('/users/change-password', data);
  return res.data;
};