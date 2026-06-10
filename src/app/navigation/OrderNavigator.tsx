/**
 * OrderNavigator.tsx
 *
 * SelectAddress is registered here so the Checkout screen can push to it
 * and navigate back with selectedAddress in params.
 *
 * Flow:
 *   OrderHistory → Checkout → SelectAddress → Checkout (with selectedAddress param)
 *                                           → OrderSuccess → OrderDetail
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CheckoutScreen }      from '../../features/order/screens/Checkout.screen';
import { OrderSuccessScreen }  from '../../features/order/screens/OrderSuccess.screen';
import { OrderHistoryScreen }  from '../../features/order/screens/OrderHistory.screen';
import { OrderDetailScreen }   from '../../features/order/screens/OrderDetail.screen';

// SelectAddressScreen lives in the profile feature but is reused here
// for the order flow — it navigates back to Checkout with the chosen address.
import { SelectAddressScreen } from '../../features/profile/screen/Selectaddressscreen';

import type { RootStackParamList } from './navigation.types';

const OrderStack = createNativeStackNavigator<RootStackParamList>()

export const OrderNavigator: React.FC = () => (
  <OrderStack.Navigator screenOptions={{ headerShown: false }}>
    <OrderStack.Screen name="OrderHistory"  component={OrderHistoryScreen} />
    <OrderStack.Screen name="Checkout"      component={CheckoutScreen} />
    <OrderStack.Screen name="SelectAddress" component={SelectAddressScreen} />
    <OrderStack.Screen name="OrderSuccess"  component={OrderSuccessScreen} />
    <OrderStack.Screen name="OrderDetail"   component={OrderDetailScreen} />
  </OrderStack.Navigator>
);