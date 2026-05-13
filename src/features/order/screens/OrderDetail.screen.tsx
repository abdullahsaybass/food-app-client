/**
 * OrderDetail.screen.tsx
 * Full order breakdown — items, address, price, status + cancel CTA.
 */

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Radius } from '../../../theme';
import { useOrderStore } from '../store/order.store';
import {
  getStatusBadge,
  formatOrderPrice,
  formatOrderDate,
  formatOrderTime,
  shortOrderId,
  isCancellable,
} from '../utils/order.utils';
import type { OrderStackParamList } from '../navigation.types';

type Nav   = NativeStackNavigationProp<OrderStackParamList, 'OrderDetail'>;
type Route = RouteProp<OrderStackParamList, 'OrderDetail'>;

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={sectionStyles.wrap}>
    <Text style={sectionStyles.title}>{title}</Text>
    <View style={sectionStyles.card}>{children}</View>
  </View>
);

const sectionStyles = StyleSheet.create({
  wrap:  { gap: 10 },
  title: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  card:  {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { orderId } = route.params;

  const activeOrder    = useOrderStore(s => s.activeOrder);
  const isFetchingOne  = useOrderStore(s => s.isFetchingOne);
  const isCancelling   = useOrderStore(s => s.isCancelling);
  const fetchError     = useOrderStore(s => s.fetchError);
  const cancelError    = useOrderStore(s => s.cancelError);
  const fetchOrderById = useOrderStore(s => s.fetchOrderById);
  const cancelOrder    = useOrderStore(s => s.cancelOrder);
  const clearActive    = useOrderStore(s => s.clearActiveOrder);

  useEffect(() => {
    fetchOrderById(orderId);
    return () => clearActive();
  }, [orderId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order', style: 'destructive',
          onPress: async () => {
            await cancelOrder(orderId);
          },
        },
      ],
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isFetchingOne || (!activeOrder && !fetchError)) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (fetchError && !activeOrder) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️  {fetchError}</Text>
          <TouchableOpacity onPress={() => fetchOrderById(orderId)} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const order = activeOrder!;
  const badge = getStatusBadge(order.status);
  const addr  = order.deliveryAddress;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{shortOrderId(order.id)}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cancel error */}
        {cancelError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️  {cancelError}</Text>
          </View>
        ) : null}

        {/* ── Status ── */}
        <Section title="Status">
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusText, { color: badge.color }]}>
                {badge.emoji}  {badge.label}
              </Text>
            </View>
            <View style={styles.dateWrap}>
              <Text style={styles.dateText}>{formatOrderDate(order.createdAt)}</Text>
              <Text style={styles.timeText}>{formatOrderTime(order.createdAt)}</Text>
            </View>
          </View>
        </Section>

        {/* ── Items ── */}
        <Section title="Items Ordered">
          {order.items.map((item, idx) => (
            <View
              key={`${item.product.id}-${idx}`}
              style={[styles.itemRow, idx > 0 && styles.itemBorder]}
            >
              {item.product.image ? (
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.itemImage, styles.itemPlaceholder]}>
                  <Text style={{ fontSize: 22 }}>📦</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.product.unit} · Qty {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{formatOrderPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
        </Section>

        {/* ── Delivery address ── */}
        <Section title="Delivery Address">
          <View style={styles.addressBlock}>
            <Text style={styles.addressName}>{addr.fullName}</Text>
            <Text style={styles.addressLine}>{addr.phone}</Text>
            <Text style={styles.addressLine}>{addr.street}</Text>
            <Text style={styles.addressLine}>
              {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}
            </Text>
          </View>
        </Section>

        {/* ── Price breakdown ── */}
        <Section title="Price Breakdown">
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatOrderPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping Fee</Text>
            <Text style={styles.priceValue}>{formatOrderPrice(order.shippingFee)}</Text>
          </View>
          {order.discount > 0 ? (
            <>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount</Text>
                <Text style={[styles.priceValue, { color: '#4CAF50' }]}>
                  {`−${formatOrderPrice(order.discount)}`}
                </Text>
              </View>
            </>
          ) : null}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatOrderPrice(order.totalAmount)}</Text>
          </View>
        </Section>
      </ScrollView>

      {/* Cancel CTA — only for cancellable statuses */}
      {isCancellable(order.status) && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, isCancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.88}
          >
            {isCancelling
              ? <ActivityIndicator color={Colors.error} />
              : <Text style={styles.cancelBtnText}>Cancel Order</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: 30, color: Colors.textPrimary, lineHeight: 34 },
  headerTitle: { ...Typography.headingMedium, color: Colors.textPrimary },

  errorBanner: {
    backgroundColor: '#FFF3CD', borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FFEEBA',
  },
  errorBannerText: { ...Typography.bodySmall, color: '#856404' },
  errorText:       { ...Typography.bodyMedium, color: Colors.error },
  retryBtn:  { paddingHorizontal: 24, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.primary },
  retryBtnText: { ...Typography.labelLarge, color: Colors.white },

  // Status
  statusRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  statusText:  { ...Typography.bodyMedium, fontWeight: '700' },
  dateWrap:    { alignItems: 'flex-end' },
  dateText:    { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  timeText:    { ...Typography.bodySmall, color: Colors.textSecondary },

  // Items
  itemRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  itemImage:  { width: 56, height: 56, borderRadius: Radius.md, overflow: 'hidden' },
  itemPlaceholder: { backgroundColor: Colors.grey100, alignItems: 'center', justifyContent: 'center' },
  itemInfo:   { flex: 1 },
  itemName:   { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  itemMeta:   { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  itemPrice:  { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },

  // Address
  addressBlock: { gap: 3 },
  addressName:  { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  addressLine:  { ...Typography.bodyMedium, color: Colors.textSecondary },

  // Price
  priceRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel:  { ...Typography.bodyMedium, color: Colors.textSecondary },
  priceValue:  { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  totalLabel:  { ...Typography.titleLarge, color: Colors.textPrimary },
  totalValue:  { ...Typography.headingMedium, color: Colors.textPrimary, fontWeight: '800' },
  priceDivider:{ height: 1, backgroundColor: Colors.border },

  // Footer
  footer: {
    backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cancelBtn: {
    height: 52, borderRadius: Radius.full,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.error,
  },
  cancelBtnText: { ...Typography.labelLarge, color: Colors.error },
});