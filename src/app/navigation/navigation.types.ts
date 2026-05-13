// src/navigation/navigation.types.ts

import { NativeStackScreenProps } from '@react-navigation/native-stack';


export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
 
};

export type MainTabParamList = {
  Home:      undefined;
  Favourite: undefined;
  Cart:      undefined;   // ← add this
  Orders:    undefined;
  Account:   undefined;
};

// ─── Product Stack (inside Home tab) ─────────────────────────────────────────
export type ProductStackParamList = {
  HomeScreen:    undefined;
  ProductList:   { categoryId?: string; categoryName?: string } | undefined;
  ProductDetail: { productId: string };
  Search:        undefined;
  Cart:          undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings:    undefined;
};

// Update MainTabParamList — Account tab now has a stack
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;