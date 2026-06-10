/**
 * AppNavigator.tsx
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList }     from './navigation.types';
import MainNavigator                   from './MainNavigator';

// ── Auth ─────────────────────────────────────────────────────────────────────
import { SplashScreen }         from '../../features/auth/screens/Splash.screen';
import { LoginScreen }          from '../../features/auth/screens/Login.screen';
import { RegisterScreen }       from '../../features/auth/screens/Register.screen';
import { ForgotPasswordScreen } from '../../features/auth/screens/ForgotPassword.screen';

// ── Products ─────────────────────────────────────────────────────────────────
import { ProductDetailScreen }     from '../../features/product/screens/ProductDetail.screen';
import { CategoryProductsScreen }  from '../../features/product/screens/Categoryproducts.screen';

// ── Checkout flow ─────────────────────────────────────────────────────────────
import { CheckoutScreen }       from '../../features/order/screens/Checkout.screen';
import { SelectAddressScreen }  from '../../features/profile/screen/Selectaddressscreen';
import { AddAddressScreen }     from '../../features/profile/screen/Addaddressscreen';
import { OrderSuccessScreen }   from '../../features/order/screens/OrderSuccess.screen';
import { OrderDetailScreen }    from '../../features/order/screens/OrderDetail.screen';
import { OrderHistoryScreen }   from '../../features/order/screens/OrderHistory.screen';

// ── Profile flow ──────────────────────────────────────────────────────────────
import { EditProfileScreen }    from '../../features/profile/screen/EditProfile.screen';
import { SettingsScreen }       from '../../features/profile/screen/Settings.screen';
import { ChangePasswordScreen } from '../../features/profile/screen/Changepassword.screen';
import { StaticContentScreen }  from '../../features/profile/screen/Staticcontentscreen';

const Root = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <Root.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      
    }}
  >

    {/* ── Splash ────────────────────────────────────────────────── */}
    <Root.Screen name="Splash" component={SplashScreen}
      options={{ animation: 'none' }} />

    {/* ── Tab shell ─────────────────────────────────────────────── */}
    <Root.Screen name="MainTabs" component={MainNavigator}
      options={{ animation: 'none' }} />

    {/* ── Auth ──────────────────────────────────────────────────── */}
    <Root.Screen name="Login"          component={LoginScreen} />
    <Root.Screen name="Register"       component={RegisterScreen}
      options={{ animation: 'slide_from_bottom', animationDuration: 500 }} />
    <Root.Screen name="ForgotPassword" component={ForgotPasswordScreen}
      options={{ animation: 'slide_from_bottom', animationDuration: 500 }} />

    {/* ── Products ──────────────────────────────────────────────── */}
    <Root.Screen name="ProductDetail"    component={ProductDetailScreen} />
    <Root.Screen name="CategoryProducts" component={CategoryProductsScreen} />

    {/* ── Checkout flow ─────────────────────────────────────────── */}
    <Root.Screen name="Checkout"       component={CheckoutScreen} />
    <Root.Screen name="SelectAddress"  component={SelectAddressScreen} />
    <Root.Screen name="AddAddress"     component={AddAddressScreen} />
    <Root.Screen name="OrderSuccess"   component={OrderSuccessScreen} />
    <Root.Screen name="OrderDetail"    component={OrderDetailScreen} />
    <Root.Screen name="OrderHistory"   component={OrderHistoryScreen} />

    {/* ── Profile flow ──────────────────────────────────────────── */}
    <Root.Screen name="EditProfile"    component={EditProfileScreen} />
    <Root.Screen name="Settings"       component={SettingsScreen} />
    <Root.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Root.Screen name="StaticContent"  component={StaticContentScreen} />

  </Root.Navigator>
);