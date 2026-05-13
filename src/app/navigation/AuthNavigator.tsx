import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './navigation.types';
import { SplashScreen } from '../../features/auth/screens/Splash.screen';
import { LoginScreen } from '../../features/auth/screens/Login.screen';
import { RegisterScreen } from '../../features/auth/screens/Register.screen';
import  ForgotPasswordScreen  from '../../features/auth/screens/ForgotPassword.screen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
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
    {/* Add Otp, ForgotPassword, ResetPassword when ready */}
  </Stack.Navigator>
);