import { API } from '../../../app/lib/api';

// REGISTER
export const registerApi = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = await API.post('/auth/register', data);
  return res.data;
};

// LOGIN ✅
export const loginApi = async (data: {
  email: string;
  password: string;
}) => {
  const res = await API.post('/auth/login', data);
  return res.data; // MUST return data only
};

// LOGOUT
export const logoutApi = async () => {
  const res = await API.post('/auth/logout');
  return res.data;
};

// PROFILE (FIX: should be GET usually)
export const forgotPasswordApi = async (email: string) => {
  const res = await API.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPasswordApi = async (data: {
  token: string;
  newPassword: string;
}) => {
  const res = await API.post('/auth/reset-password', data);
  return res.data;
};