/**
 * AuthNavigator.tsx
 *
 * NOTE: This navigator is only needed if you want a Splash screen
 * before entering the main app. If not, you can delete this file —
 * Login / Register / ForgotPassword are already registered in
 * AppNavigator and accessible from anywhere.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation.types';

import { LoginScreen }          from '../../features/auth/screens/Login.screen';
import { RegisterScreen }       from '../../features/auth/screens/Register.screen';
import { ForgotPasswordScreen } from '../../features/auth/screens/ForgotPassword.screen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown:  false,
      animation:    'slide_from_right',
      contentStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen name="Login"          component={LoginScreen} />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);