import { API } from '../../../app/lib/api';
import type { User } from '../../../types/user.types';

/* =========================
   TYPES
========================= */

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type ForgotPasswordInput = string;

type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
};

type BasicResponse = {
  success: boolean;
  message: string;
};

/* =========================
   REGISTER
========================= */

export const registerApi = async (
  data: RegisterInput
): Promise<AuthResponse> => {

  const res = await API.post('/auth/register', data);

  return res.data;
};

/* =========================
   LOGIN
========================= */

export const loginApi = async (
  data: LoginInput
): Promise<AuthResponse> => {

  const res = await API.post('/auth/login', data);
  console.log('LOGIN RESPONSE:', JSON.stringify(res, null, 2));
  return res.data;
};

/* =========================
   LOGOUT
========================= */

export const logoutApi = async (): Promise<BasicResponse> => {

  const res = await API.post('/auth/logout');

  return res.data;
};

/* =========================
   FORGOT PASSWORD
========================= */

export const forgotPasswordApi = async (
  email: ForgotPasswordInput
): Promise<BasicResponse> => {

  const res = await API.post(
    '/auth/forgot-password',
    { email }
  );

  return res.data;
};

/* =========================
   RESET PASSWORD
========================= */

export const resetPasswordApi = async (
  data: ResetPasswordInput
): Promise<BasicResponse> => {

  const res = await API.post(
    '/auth/reset-password',
    data
  );

  return res.data;
};