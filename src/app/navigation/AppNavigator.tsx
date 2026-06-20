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
import { NotificationScreen }      from '../../features/notification/screen/Notification.screen';

// ── Checkout flow ─────────────────────────────────────────────────────────────
import { CheckoutScreen }       from '../../features/order/screens/Checkout.screen';
import { SelectAddressScreen }  from '../../features/profile/screen/Selectaddressscreen';
import { AddAddressScreen }     from '../../features/profile/screen/Addaddressscreen';
import { ChooseLocationScreen } from '../../features/profile/screen/ChooseLocation.screen';
import { OrderSuccessScreen }   from '../../features/order/screens/OrderSuccess.screen';
import { OrderDetailScreen }    from '../../features/order/screens/OrderDetail.screen';
import { OrderHistoryScreen }   from '../../features/order/screens/OrderHistory.screen';
import { InvoiceScreen }        from '../../features/order/screens/Invoice.screen';

// ── Profile flow ──────────────────────────────────────────────────────────────
import { EditProfileScreen }    from '../../features/profile/screen/EditProfile.screen';
import { SettingsScreen }       from '../../features/profile/screen/Settings.screen';
import { ChangePasswordScreen } from '../../features/profile/screen/Changepassword.screen';
import { StaticContentScreen }  from '../../features/profile/screen/Staticcontentscreen';

const Root = createNativeStackNavigator<RootStackParamList>();

// ── Shared transition configs ─────────────────────────────────────────────────

/** Standard right-slide with a subtle fade — used for most screens */
const slideRight = {
  animation: 'slide_from_right' as const,
  animationDuration: 280,
  customAnimationOnGesture: true,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

/** Bottom-sheet style — used for modal-ish screens */
const slideUp = {
  animation: 'slide_from_bottom' as const,
  animationDuration: 320,
  customAnimationOnGesture: true,
  gestureEnabled: true,
};

export const AppNavigator: React.FC = () => (
  <Root.Navigator
    screenOptions={{
      headerShown: false,
      ...slideRight,
    }}
  >
    {/* ── Splash ────────────────────────────────────────────────── */}
    <Root.Screen name="Splash" component={SplashScreen}
      options={{ animation: 'fade', animationDuration: 400 }} />

    {/* ── Tab shell ─────────────────────────────────────────────── */}
    <Root.Screen name="MainTabs" component={MainNavigator}
      options={{ animation: 'fade', animationDuration: 300, gestureEnabled: false }} />

    {/* ── Auth ──────────────────────────────────────────────────── */}
    <Root.Screen name="Login"          component={LoginScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="Register"       component={RegisterScreen}
      options={{ ...slideUp }} />
    <Root.Screen name="ForgotPassword" component={ForgotPasswordScreen}
      options={{ ...slideUp }} />

    {/* ── Products ──────────────────────────────────────────────── */}
    <Root.Screen name="ProductDetail"    component={ProductDetailScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="CategoryProducts" component={CategoryProductsScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="Notifications"    component={NotificationScreen}
      options={{ ...slideRight }} />

    {/* ── Checkout flow ─────────────────────────────────────────── */}
    <Root.Screen name="Checkout"       component={CheckoutScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="SelectAddress"  component={SelectAddressScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="AddAddress"     component={AddAddressScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="ChooseLocation" component={ChooseLocationScreen}
      options={{ ...slideUp }} />
    <Root.Screen name="OrderSuccess"   component={OrderSuccessScreen}
      options={{ animation: 'fade', animationDuration: 350 }} />
    <Root.Screen name="OrderDetail"    component={OrderDetailScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="OrderHistory"   component={OrderHistoryScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="Invoice"        component={InvoiceScreen}
      options={{ ...slideRight }} />

    {/* ── Profile flow ──────────────────────────────────────────── */}
    <Root.Screen name="EditProfile"    component={EditProfileScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="Settings"       component={SettingsScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="ChangePassword" component={ChangePasswordScreen}
      options={{ ...slideRight }} />
    <Root.Screen name="StaticContent"  component={StaticContentScreen}
      options={{ ...slideRight }} />

  </Root.Navigator>
);