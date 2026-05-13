import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from './src/app/navigation/RootNavigator';
import { initAuth } from './src/app/init/app.init';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}