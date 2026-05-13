import { loginApi, registerApi, forgotPasswordApi, resetPasswordApi } from '../api/auth.api';

export const authService = {
  // 🔐 LOGIN
  login: async (email: string, password: string) => {
    const res = await loginApi({ email, password });

    console.log("LOGIN RAW:", res);

    const user = res.user || res.data?.user;
    const token = res.accessToken || res.data?.accessToken;

    return { token, user };
  },

  // 📝 REGISTER
  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const res = await registerApi(data);

    console.log("REGISTER RAW:", res);

    // usually register doesn't return token
    // just return response for confirmation
    return res;
  },

  forgotPassword: async (email: string) => {
    return await forgotPasswordApi(email);
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await resetPasswordApi({ token, newPassword });
  },
};