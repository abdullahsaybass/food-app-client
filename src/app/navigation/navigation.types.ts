/**
 * navigation.types.ts
 *
 * Single source of truth for every navigable screen.
 * All screens live in RootStackParamList → registered in AppNavigator.
 * MainTabParamList is only for the 5 tab icons.
 *
 * From any screen you can navigate to any other screen with:
 *   const navigation = useNavigation<NavigationProp<RootStackParamList>>();
 *   navigation.navigate('Checkout');
 *   navigation.navigate('EditProfile');
 *   navigation.navigate('OrderDetail', { orderId });
 */

import type { NativeStackScreenProps }    from '@react-navigation/native-stack';
import type { NavigatorScreenParams }     from '@react-navigation/native';
import type { Address }                   from '../../types/user.types';

// ─── Root Stack ───────────────────────────────────────────────────────────────

export type RootStackParamList = {

  // ── Splash ─────────────────────────────────────────────────────
  Splash: undefined;

  // ── Tab shell ──────────────────────────────────────────────────
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // ── Auth ───────────────────────────────────────────────────────
  Login:          undefined;
  Register:       undefined;
  ForgotPassword: undefined;

  // ── Products ───────────────────────────────────────────────────
  ProductDetail:    { productId: string };
  CategoryProducts: { categoryId: string; categoryName: string };
  OrderHistory: undefined;
  Notifications: undefined;

  // ── Cart & Checkout flow ───────────────────────────────────────
  // Cart is a tab — navigate to it with:
  //   navigation.navigate('MainTabs', { screen: 'Cart' })
  Checkout:      { selectedAddressId?: string } | undefined;
  SelectAddress: { initialSelectedId?: string } | undefined;
  AddAddress:    { address?: Address }           | undefined;
  // Instamart-style map picker — returns picked location via locationPicker.store
  ChooseLocation: {
    initialLatitude?:  number;
    initialLongitude?: number;
  } | undefined;
  OrderSuccess:  {
    orderId:        string;
    cartTotal:      number;
    cartItems?:     any[];
    discount?:      number;
    paymentMethod?: string;
  };
  OrderDetail: { orderId: string };

  // ── Profile flow ───────────────────────────────────────────────
  ProfileHome:    undefined;
  EditProfile:    undefined;
  Settings:       undefined;
  ChangePassword: undefined;
  StaticContent:  { type: 'about' | 'faq' | 'privacy' | 'terms' | 'help' };
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Home:      undefined;
  Favourite: undefined;
  Cart:      undefined;
  Account:   undefined;
};

// ─── Screen prop helpers ──────────────────────────────────────────────────────

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;