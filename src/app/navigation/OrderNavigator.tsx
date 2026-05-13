import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CheckoutScreen }     from '../../features/order/screens/Checkout.screen';
import { OrderSuccessScreen } from '../../features/order/screens/OrderSuccess.screen';
import { OrderHistoryScreen } from '../../features/order/screens/OrderHistory.screen';
import { OrderDetailScreen }  from '../../features/order/screens/OrderDetail.screen';
import type { OrderStackParamList } from '../../features/order/navigation.types';

const OrderStack = createNativeStackNavigator<OrderStackParamList>();

export const OrderNavigator: React.FC = () => (
  <OrderStack.Navigator screenOptions={{ headerShown: false }}>
    <OrderStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <OrderStack.Screen name="Checkout"     component={CheckoutScreen} />
    <OrderStack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    <OrderStack.Screen name="OrderDetail"  component={OrderDetailScreen} />
  </OrderStack.Navigator>
);