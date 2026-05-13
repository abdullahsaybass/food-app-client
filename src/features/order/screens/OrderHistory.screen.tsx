/**
 * OrderHistory.screen.tsx — fixed
 * Fix: {firstItem && (...)} → {firstItem ? (...) : null} to prevent bare text node crash
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Radius } from '../../../theme';
import { useOrderStore } from '../store/order.store';
import {
  getStatusBadge,
  formatOrderPrice,
  formatOrderDate,
  shortOrderId,
} from '../utils/order.utils';
import type { Order } from '../types/order.types';
import type { OrderStackParamList } from '../navigation.types';

type Nav = NativeStackNavigationProp<OrderStackParamList, 'OrderHistory'>;

const LIMIT = 10;

// ─── Order card ───────────────────────────────────────────────────────────────

const OrderCard: React.FC<{ order: Order; onPress: () => void }> = ({ order, onPress }) => {
  const badge     = getStatusBadge(order.status);
  const firstItem = order.items[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      {/* Top row — ID + status */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardOrderId}>Order #{shortOrderId(order.id)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.color }]}>
            {`${badge.emoji}  ${badge.label}`}
          </Text>
        </View>
      </View>

      {/* ✅ FIX: use ternary instead of && to avoid bare text node when firstItem is falsy */}
      {firstItem ? (
        <View style={styles.itemPreview}>
          {firstItem.product.image ? (
            <Image
              source={{ uri: firstItem.product.image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
              <Text style={{ fontSize: 22 }}>📦</Text>
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>
              {firstItem.product.name}
            </Text>
            {order.items.length > 1 ? (
              <Text style={styles.moreItems}>
                {`+${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Bottom row — date + total */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{formatOrderDate(order.createdAt)}</Text>
        <Text style={styles.cardTotal}>{formatOrderPrice(order.totalAmount)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();

  const orders      = useOrderStore(s => s.orders);
  const pagination  = useOrderStore(s => s.pagination);
  const isFetching  = useOrderStore(s => s.isFetching);
  const fetchError  = useOrderStore(s => s.fetchError);
  const fetchOrders = useOrderStore(s => s.fetchOrderHistory);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders({ page: 1, limit: LIMIT });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchOrders({ page: 1, limit: LIMIT });
    setRefreshing(false);
  }, []);

  const onEndReached = useCallback(() => {
    if (isFetching) return;
    if (!pagination) return;
    if (page >= pagination.totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchOrders({ page: next, limit: LIMIT });
  }, [isFetching, pagination, page]);

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    />
  ), [navigation]);

  const ListEmpty = () => {
    if (isFetching) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛍️</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here.</Text>
      </View>
    );
  };

  const ListFooter = () => {
    if (!isFetching || refreshing) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {fetchError && !isFetching ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{`⚠️  ${fetchError}`}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isFetching && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<ListEmpty />}
          ListFooterComponent={<ListFooter />}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFEEBA',
  },
  errorText: { ...Typography.bodySmall, color: '#856404', flex: 1 },
  retryText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700', marginLeft: 8 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 12 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardOrderId: { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  statusText: { ...Typography.bodySmall, fontWeight: '700' },

  itemPreview:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemImage:            { width: 52, height: 52, borderRadius: Radius.md, overflow: 'hidden' },
  itemImagePlaceholder: { backgroundColor: Colors.grey100, alignItems: 'center', justifyContent: 'center' },
  itemInfo:             { flex: 1 },
  itemName:             { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  moreItems:            { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate:   { ...Typography.bodySmall, color: Colors.textSecondary },
  cardTotal:  { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji:    { fontSize: 64 },
  emptyTitle:    { ...Typography.headingMedium, color: Colors.textPrimary },
  emptySubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary },

  listFooter: { paddingVertical: 20, alignItems: 'center' },
});