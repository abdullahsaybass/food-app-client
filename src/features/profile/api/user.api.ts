import { API } from '../../../app/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ─────────────────────────────────────────────
// 👤 USER PROFILE
// ─────────────────────────────────────────────

// GET current user
export const getProfileApi = async () => {
  const res = await API.get('/users/me');
  return res.data;
};

// UPDATE profile
export const updateProfileApi = async (data: {
  name?: string;
  phone?: string;
}) => {
  const res = await API.put('/users/me', data);
  return res.data;
};

// DELETE account
export const deleteAccountApi = async () => {
  const res = await API.delete('/users/me');
  return res.data;
};


// ─────────────────────────────────────────────
// 🖼️ PROFILE PICTURE
// ─────────────────────────────────────────────

export const updateProfilePictureApi = async (formData: FormData) => {
  const token = await AsyncStorage.getItem('token');
  
  console.log('🔥 token:', token);
  console.log('🔥 formData:', formData);

  try {
    const res = await API.put('/users/me/profile-pic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      transformRequest: (data) => data,
    });
    console.log('✅ response:', res.data);
    return res.data;
  } catch (err: any) {
    console.log('❌ status:', err?.response?.status);
    console.log('❌ data:', err?.response?.data);
    console.log('❌ message:', err?.message);
    throw err;
  }
};
export const removeProfilePictureApi = async () => {
  const res = await API.delete('/users/me/profile-pic');
  return res.data;
};


// ─────────────────────────────────────────────
// 📍 ADDRESSES
// ─────────────────────────────────────────────

// ADD address
export const addAddressApi = async (data: {
  street: string;
  city: string;
  state?: string;
  zip?: string;
}) => {
  const res = await API.post('/users/me/addresses', data);
  return res.data;
};

// UPDATE address
export const updateAddressApi = async (
  addressId: string,
  data: any
) => {
  const res = await API.put(`/users/me/addresses/${addressId}`, data);
  return res.data;
};

// DELETE address

export const deleteAddressApi = async (addressId: string) => {
  const res = await API.delete(`/users/me/addresses/${addressId}`);
  return res.data;
};