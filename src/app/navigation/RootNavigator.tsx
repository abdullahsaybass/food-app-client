import { useAuthStore } from '../../features/auth/store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import MainNavigator from './MainNavigator';

export const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuthStore();

  console.log("AUTH:", isAuthenticated, "LOADING:", loading);

  if (loading) return null; // or Splash

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};