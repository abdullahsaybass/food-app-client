/**
 * OrderSuccess.screen.tsx
 * Shown immediately after a successful order placement.
 * Navigates to OrderHistory or back to HomeScreen.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Radius } from '../../../theme';
import { shortOrderId } from '../utils/order.utils';
import type { OrderStackParamList } from '../navigation.types';

type Nav   = NativeStackNavigationProp<OrderStackParamList, 'OrderSuccess'>;
type Route = RouteProp<OrderStackParamList, 'OrderSuccess'>;

export const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { orderId } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.emoji}>🎉</Text>
        </View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.orderId}>Order #{shortOrderId(orderId)}</Text>
        <Text style={styles.subtitle}>
          Your order has been received and is being processed.{'\n'}
          We'll notify you when it's confirmed.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.primaryBtnText}>Track My Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => (navigation as any).navigate('HomeScreen')}
        >
          <Text style={styles.outlineBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 16,
  },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  emoji:    { fontSize: 60 },
  title:    { ...Typography.headingLarge, color: Colors.textPrimary, textAlign: 'center' },
  orderId:  { ...Typography.titleMedium, color: Colors.textSecondary, textAlign: 'center' },
  subtitle: {
    ...Typography.bodyMedium, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },

  footer:   { paddingHorizontal: 24, gap: 12 },
  primaryBtn: {
    height: 54, borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  primaryBtnText:  { ...Typography.labelLarge, color: Colors.white, fontSize: 16 },
  outlineBtn: {
    height: 52, borderRadius: Radius.full, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  outlineBtnText: { ...Typography.labelLarge, color: Colors.primary },
});