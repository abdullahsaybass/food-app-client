/**
 * OrderHistory.screen.tsx
 *
 * Redesigned to match reference design:
 * - Header: "My Orders" + subtitle + search + filter icons
 * - Tabs: All Orders | Processing | Shipped | Delivered | Cancelled
 * - Order cards: order ID + date/time + status badge in header row,
 *   product image + name + variant + qty/price, total amount, payment method + view details
 * - Support banner at bottom
 * - No "Hungry again?" promo banner
 * - Thin border, reduced shadow, clean alignment
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, Headphones, ClipboardList, CreditCard } from 'lucide-react-native';

import { Colors } from '../../../theme';
import { useOrderStore } from '../store/order.store';
import {
  getStatusBadge,
  formatOrderPrice,
  formatOrderDate,
  formatOrderTime,
  shortOrderId,
} from '../utils/order.utils';
import type { Order } from '../types/order.types';
import type { OrderStackParamList } from '../navigation.types';

type Nav = NativeStackNavigationProp<OrderStackParamList, 'OrderHistory'>;

const LIMIT  = 10;
const ORANGE = '#F97316';
const BLUE   = '#3B5BDB';

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = 'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',        label: 'All Orders'  },
  { key: 'processing', label: 'Processing'  },
  { key: 'shipped',    label: 'Shipped'     },
  { key: 'delivered',  label: 'Delivered'   },
  { key: 'cancelled',  label: 'Cancelled'   },
];

const STATUS_GROUPS: Record<TabKey, string[]> = {
  all:        [],
  processing: ['pending', 'confirmed', 'processing'],
  shipped:    ['on_the_way', 'shipped', 'out_for_delivery'],
  delivered:  ['delivered'],
  cancelled:  ['cancelled'],
};

// ─── Order card ───────────────────────────────────────────────────────────────

const OrderCard: React.FC<{ order: Order; onPress: () => void }> = ({ order, onPress }) => {
  const badge     = getStatusBadge(order.status);
  const firstItem = order.items[0];

  const itemName    = firstItem?.product?.name ?? 'Product';
  const itemVariant = firstItem?.product?.unit ?? '';
  const itemQty     = firstItem?.quantity ?? 1;
  const itemPrice   = firstItem?.price ?? 0;
  const itemTotal   = itemPrice * itemQty;

  const dateStr      = formatOrderDate(order.createdAt);
  const timeStr      = formatOrderTime(order.createdAt);
  const paymentLabel = 'Cash on Delivery';

  return (
    <View style={oc.card}>
      {/* ── Card header row: order ID + date + status + chevron ── */}
      <View style={oc.cardHeader}>
        <View style={oc.headerLeft}>
          <Text style={oc.orderId}>Order #{shortOrderId(order.id)}</Text>
          <Text style={oc.headerMeta}>
            {dateStr}
            {'  •  '}
            {timeStr}
          </Text>
        </View>
        <TouchableOpacity
          style={oc.headerRight}
          onPress={onPress}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[oc.badge, { backgroundColor: badge.bg }]}>
            <View style={[oc.badgeDot, { backgroundColor: badge.color }]} />
            <Text style={[oc.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Text style={oc.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Divider ── */}
      <View style={oc.divider} />

      {/* ── Product row ── */}
      <View style={oc.productRow}>
        {/* Image */}
        {firstItem?.product?.image ? (
          <Image
            source={{ uri: firstItem.product.image }}
            style={oc.img}
            resizeMode="cover"
          />
        ) : (
          <View style={[oc.img, oc.imgPlaceholder]}>
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
        )}

        {/* Product info */}
        <View style={oc.productInfo}>
          <View style={oc.productNameRow}>
            <Text style={oc.productName} numberOfLines={1}>{itemName}</Text>
            {!!itemVariant && (
              <Text style={oc.variantTag}>{itemVariant}</Text>
            )}
          </View>
          <View style={oc.priceQtyRow}>
            <Text style={oc.priceQty}>
              {formatOrderPrice(itemPrice)} × {itemQty}
            </Text>
            <Text style={oc.lineTotal}>{formatOrderPrice(itemTotal)}</Text>
          </View>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={oc.divider} />

      {/* ── Total amount row ── */}
      <View style={oc.footerRow}>
        <View style={oc.footerLeft}>
          <ClipboardList size={14} color={Colors.textSecondary} strokeWidth={1.8} />
          <Text style={oc.footerLabel}>Total Amount</Text>
        </View>
        <Text style={oc.totalAmount}>{formatOrderPrice(order.totalAmount)}</Text>
      </View>

      {/* ── Payment + View Details row ── */}
      <View style={oc.footerRow}>
        <View style={oc.footerLeft}>
          <CreditCard size={14} color={Colors.textSecondary} strokeWidth={1.8} />
          <Text style={oc.footerLabel}>Payment</Text>
          <View style={oc.footerSep} />
          <Text style={oc.paymentValue}>{paymentLabel}</Text>
        </View>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={oc.viewDetails}>
          <Text style={oc.viewDetailsText}>View Details</Text>
          <Text style={oc.viewDetailsChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const oc = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1, gap: 3 },
  orderId:    { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  headerMeta: { fontSize: 12, color: Colors.textSecondary },
  headerRight:{ flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Status badge (pill with dot)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  chevron:   { fontSize: 18, color: Colors.textSecondary, lineHeight: 22 },

  divider: { height: 1, backgroundColor: '#F0F1F5', marginHorizontal: 0 },

  // Product row
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  img: {
    width: 68,
    height: 68,
    borderRadius: 10,
    flexShrink: 0,
  },
  imgPlaceholder: {
    backgroundColor: Colors.grey100 ?? '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1, gap: 6 },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  variantTag: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceQty:  { fontSize: 13, color: Colors.textSecondary },
  lineTotal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  // Footer rows
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  footerLabel:  { fontSize: 12, color: Colors.textSecondary },
  footerSep:    { width: 1, height: 12, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  paymentValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  totalAmount:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  // View details
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText:    { fontSize: 12, color: Colors.textSecondary },
  viewDetailsChevron: { fontSize: 16, color: Colors.textSecondary, lineHeight: 20 },
});

// ─── Support banner ───────────────────────────────────────────────────────────

const SupportBanner: React.FC = () => (
  <View style={sb.wrap}>
    <View style={sb.iconWrap}>
      <Headphones size={20} color={BLUE} strokeWidth={1.8} />
    </View>
    <View style={sb.textBlock}>
      <Text style={sb.title}>Need help with your order?</Text>
      <Text style={sb.sub}>Our support team is here to help you.</Text>
    </View>
    <TouchableOpacity style={sb.btn} activeOpacity={0.8}>
      <Text style={sb.btnText}>Contact Support</Text>
    </TouchableOpacity>
  </View>
);

const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: { flex: 1, gap: 2 },
  title:     { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  sub:       { fontSize: 11, color: Colors.textSecondary },
  btn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexShrink: 0,
  },
  btnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
});

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
  const [page,       setPage]       = useState(1);
  const [activeTab,  setActiveTab]  = useState<TabKey>('all');

  useEffect(() => {
    fetchOrders({ page: 1, limit: LIMIT });
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return orders;
    const group = STATUS_GROUPS[activeTab];
    return orders.filter(o => group.includes(o.status));
  }, [orders, activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchOrders({ page: 1, limit: LIMIT });
    setRefreshing(false);
  }, []);

  const onEndReached = useCallback(() => {
    if (isFetching || !pagination || page >= pagination.totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchOrders({ page: next, limit: LIMIT });
  }, [isFetching, pagination, page]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        order={item}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>My Orders</Text>
          <Text style={s.headerSubtitle}>Track and manage all your orders</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <Search size={18} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <SlidersHorizontal size={18} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabsOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, active && s.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Error banner ── */}
      {fetchError && !isFetching ? (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{`⚠️  ${fetchError}`}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Initial loading ── */}
      {isFetching && orders.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o.id}
          renderItem={renderItem}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            <>
              {orders.length > 0 ? <SupportBanner /> : null}
              {isFetching && !refreshing ? (
                <View style={s.listFooter}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            !isFetching ? (
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>🛍️</Text>
                <Text style={s.emptyTitle}>No orders yet</Text>
                <Text style={s.emptySubtitle}>Your order history will appear here.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: Colors.white,
  },
  headerText:     { flex: 1, gap: 3 },
  headerTitle:    { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '400' },
  headerActions:  { flexDirection: 'row', gap: 8, paddingTop: 4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.grey100 ?? '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabsOuter: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  tabsContent: { paddingHorizontal: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 2,
  },
  tabActive:     { borderBottomColor: BLUE },
  tabText:       { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: BLUE, fontWeight: '700' },

  // Error
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEEBA',
  },
  errorText: { fontSize: 12, color: '#856404', flex: 1 },
  retryText: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginLeft: 8 },

  listContent: { padding: 16 },
  listFooter:  { paddingVertical: 20, alignItems: 'center' },

  // Empty
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji:    { fontSize: 64 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary },
});