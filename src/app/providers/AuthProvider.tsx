import React, { useEffect } from 'react';
import { useAuthStore } from '../../features/auth/store/auth.store';

// If you already have an auth context from before, import it here
// and sync its values into the zustand store below.
// Example assumes you have useAuth() hook returning { isAuthenticated, token, user }

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  // If you already have auth context — sync it here:
  // const { isAuthenticated, token, user } = useExistingAuth();
  // const { login } = useAuthStore();
  //
  // useEffect(() => {
  //   if (isAuthenticated && token && user) login(token, user);
  // }, [isAuthenticated]);

  return <>{children}</>;
};