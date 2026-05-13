import { useAuthStore } from '../../features/auth/store/auth.store';

export const initAuth = async () => {
  await useAuthStore.getState().hydrate();
};