/**
 * OrderDetailScreen.tsx
 *
 * Matches reference design:
 *  - Header: back + "Order Details" + order ID + Help button
 *  - Status card: icon / label / description / cancel button (pending|confirmed only)
 *  - Animated 5-step timeline (line fills left-to-right per completed segment)
 *  - Delivery address with View on Map
 *  - Order items list with images
 *  - Order summary (subtotal / discount / delivery / total)
 *  - 2×2 Order Information grid (Payment Method | Invoice | Payment Status | Need Help)
 *  - COD-only: no digital invoice, payment status = Pending → Collected
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Check,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react-native';

import { API }          from '../../../app/lib/api';
import { Colors }       from '../../../theme';
import {
  formatOrderDate,
  formatOrderTime,
  formatOrderPrice,
  shortOrderId,
} from '../utils/order.utils';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type Route = RouteProp<RootStackParamList, 'OrderDetail'>;

// ─── Theme ────────────────────────────────────────────────────────────────────
const ORANGE       = '#F97316';
const ORANGE_LIGHT = '#FFF7ED';
const GREEN        = '#16A34A';
const GREEN_LIGHT  = '#F0FDF4';
const RED          = '#EF4444';
const SHIPPING     = 25;

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'on_the_way'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

interface StatusHistoryEntry {
  status:    OrderStatus;
  timestamp: string;
  note?:     string;
}

interface OrderDetailItem {
  product: { id: string; name: string; image: string };
  unit:     string;
  quantity: number;
  price:    number;
}

interface OrderDetail {
  id:              string;
  status:          OrderStatus;
  items:           OrderDetailItem[];
  totalAmount:     number;
  subtotal:        number;
  discount:        number;
  deliveryFee:     number;
  paymentMethod:   string;
  statusHistory:   StatusHistoryEntry[];
  shippingAddress: {
    fullName:    string;
    phone:       string;
    street:      string;
    city:        string;
    state?:      string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Backend mapper ───────────────────────────────────────────────────────────
const mapOrder = (raw: any): OrderDetail => ({
  id:            raw._id         ?? raw.id    ?? '',
  status:        raw.status      ?? 'pending',
  items: (raw.items ?? []).map((i: any) => ({
    product: {
      id:    i.product?._id ?? i.product?.id ?? i.productId ?? '',
      name:  i.product?.name  ?? i.name  ?? '',
     image: (() => {
      const img = i.product?.image ?? i.image;
      if (!img) return '';
      if (typeof img === 'string') return img;
      return img.url ?? img.uri ?? '';
    })(),
    },
    unit:     i.unit     ?? '',
    quantity: i.quantity ?? 1,
    price:    i.price    ?? 0,
  })),
  totalAmount:   raw.totalAmount    ?? 0,
  subtotal:      raw.subtotal       ?? raw.totalAmount ?? 0,
  discount:      raw.discount       ?? 0,
  deliveryFee:   raw.deliveryFee    ?? SHIPPING,
  paymentMethod: raw.paymentMethod  ?? 'Cash on Delivery',
  statusHistory: raw.statusHistory  ?? [],
  shippingAddress: {
    fullName:   raw.shippingAddress?.fullName   ?? '',
    phone:      raw.shippingAddress?.phone      ?? '',
    street:     raw.shippingAddress?.street     ?? '',
    city:       raw.shippingAddress?.city       ?? '',
    state:      raw.shippingAddress?.state,
    postalCode: raw.shippingAddress?.postalCode ?? raw.shippingAddress?.zip,
  },
  createdAt: raw.createdAt ?? '',
  updatedAt: raw.updatedAt ?? '',
});

// ─── Timeline config ──────────────────────────────────────────────────────────
const TIMELINE_STEPS: {
  statuses: OrderStatus[];
  label:    string;
  Icon:     React.ComponentType<any>;
}[] = [
  { statuses: ['pending'],                        label: 'Placed',           Icon: ClipboardList },
  { statuses: ['confirmed'],                      label: 'Confirmed',        Icon: CreditCard    },
  { statuses: ['processing'],                     label: 'Packed',           Icon: Package       },
  { statuses: ['on_the_way', 'out_for_delivery'], label: 'Out for Delivery', Icon: Truck         },
  { statuses: ['delivered'],                      label: 'Delivered',        Icon: Check         },
];

const STATUS_STEP: Record<OrderStatus, number> = {
  pending:          0,
  confirmed:        1,
  processing:       2,
  on_the_way:       3,
  out_for_delivery: 3,
  delivered:        4,
  cancelled:        -1,
};

const getStepTs = (
  history: StatusHistoryEntry[],
  statuses: OrderStatus[],
  createdAt: string,
  stepIdx: number,
): string | null => {
  const found = history.find(h => statuses.includes(h.status));
  if (found) return found.timestamp;
  return stepIdx === 0 ? createdAt : null;
};

// ─── Animated Timeline ────────────────────────────────────────────────────────
const StatusTimeline: React.FC<{
  status:        OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt:     string;
}> = ({ status, statusHistory, createdAt }) => {
  const currentStep = STATUS_STEP[status] ?? 0;
  const isDelivered = status === 'delivered';
  const lineColor   = isDelivered ? GREEN : ORANGE;

  // 4 segment animations (5 steps → 4 connecting lines)
  const segAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;

  // Pulse for active step
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fill each completed segment with stagger
    const fills = segAnims
      .slice(0, currentStep)
      .map((anim, i) =>
        Animated.timing(anim, {
          toValue:        1,
          duration:       450,
          delay:          i * 200,
          useNativeDriver: false,
        }),
      );
    Animated.parallel(fills).start();

    // Pulse active node
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    if (currentStep < 4 && status !== 'cancelled') pulse.start();
    return () => pulse.stop();
  }, [currentStep, status]);

  return (
    <View style={tl.wrapper}>
      {TIMELINE_STEPS.map((step, idx) => {
        const done   = isDelivered ? true : idx < currentStep;
        const active = !isDelivered && idx === currentStep && status !== 'cancelled';
        const ts     = getStepTs(statusHistory, step.statuses, createdAt, idx);
        const { Icon } = step;

        const nodeBg = done
          ? lineColor
          : active
          ? ORANGE
          : '#E5E7EB';

        return (
          <React.Fragment key={step.label}>
            {/* Node column */}
            <View style={tl.col}>
              {/* Pulse ring behind active node */}
              {active && (
                <Animated.View
                  style={[
                    tl.pulseRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              )}
              <View style={[tl.node, { backgroundColor: nodeBg }]}>
                {done && idx < 4 ? (
                  <Check size={13} color="#fff" strokeWidth={3.5} />
                ) : (
                  <Icon
                    size={13}
                    color={(done || active) ? '#fff' : '#9CA3AF'}
                    strokeWidth={2}
                  />
                )}
              </View>
              <Text
                style={[
                  tl.label,
                  (done || active) && {
                    color:      Colors.textPrimary,
                    fontWeight: '700',
                  },
                ]}
              >
                {step.label}
              </Text>
              {ts ? (
                <>
                  <Text style={tl.date}>{formatOrderDate(ts)}</Text>
                  <Text style={tl.time}>{formatOrderTime(ts)}</Text>
                </>
              ) : null}
            </View>

            {/* Segment line */}
            {idx < 4 && (
              <View style={tl.segment}>
                <Animated.View
                  style={[
                    tl.segFill,
                    {
                      width: segAnims[idx].interpolate({
                        inputRange:  [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: lineColor,
                    },
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const tl = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    paddingHorizontal: 14,
    paddingVertical:   18,
  },
  col: {
    alignItems: 'center',
    width:      52,
    gap:        4,
    position:   'relative',
  },
  pulseRing: {
    position:        'absolute',
    top:             -3,
    width:           42,
    height:          42,
    borderRadius:    21,
    backgroundColor: ORANGE + '28',
    zIndex:          0,
  },
  node: {
    width:           36,
    height:          36,
    borderRadius:    18,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          1,
  },
  label: {
    fontSize:   9,
    fontWeight: '500',
    color:      '#9CA3AF',
    textAlign:  'center',
    lineHeight: 12,
  },
  date: {
    fontSize:   8,
    color:      Colors.textSecondary,
    textAlign:  'center',
  },
  time: {
    fontSize:   8,
    color:      Colors.textSecondary,
    textAlign:  'center',
    fontWeight: '600',
  },
  segment: {
    flex:            1,
    height:          3,
    backgroundColor: '#E5E7EB',
    borderRadius:    2,
    marginTop:       17,
    overflow:        'hidden',
  },
  segFill: {
    height:       '100%',
    borderRadius: 2,
  },
});

// ─── Status meta ──────────────────────────────────────────────────────────────
const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; desc: string }
> = {
  pending:          { label: 'Order Placed',     color: '#D97706', bg: '#FFFBEB',    desc: 'Your order has been placed and is awaiting confirmation.' },
  confirmed:        { label: 'Order Confirmed',  color: ORANGE,    bg: ORANGE_LIGHT, desc: 'Your order is confirmed and is being prepared.' },
  processing:       { label: 'Being Packed',     color: '#7C3AED', bg: '#F5F3FF',    desc: 'Your items are being packed and ready for dispatch soon.' },
  on_the_way:       { label: 'Out for Delivery', color: '#2563EB', bg: '#EFF6FF',    desc: 'Your order is on the way to you!' },
  out_for_delivery: { label: 'Out for Delivery', color: '#2563EB', bg: '#EFF6FF',    desc: 'Your order is out for delivery!' },
  delivered:        { label: 'Delivered',        color: GREEN,     bg: GREEN_LIGHT,  desc: 'Your order has been delivered successfully.' },
  cancelled:        { label: 'Cancelled',        color: RED,       bg: '#FEF2F2',    desc: 'This order has been cancelled.' },
};

// ─── Item Row ─────────────────────────────────────────────────────────────────
const ITEM_COLORS = ['#F97316', '#EF4444', '#D97706', '#8B5CF6', '#10B981'];

const ItemRow: React.FC<{
  item:    OrderDetailItem;
  idx:     number;
  isLast?: boolean;
}> = ({ item, idx, isLast }) => {
  const bg    = ITEM_COLORS[idx % ITEM_COLORS.length];
  const total = item.price * item.quantity;

  return (
    <View style={[ir.row, !isLast && ir.rowBorder]}>
      {item.product.image ? (
        <Image
          source={{ uri: item.product.image }}
          style={ir.img}
          resizeMode="cover"
        />
      ) : (
        <View style={[ir.avatar, { backgroundColor: bg }]}>
          <Text style={ir.avatarTxt}>
            {item.product.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={ir.info}>
        <Text style={ir.name} numberOfLines={1}>{item.product.name}</Text>
        <Text style={ir.variant}>{item.unit}</Text>
        <Text style={ir.unitPrice}>{formatOrderPrice(item.price)}</Text>
      </View>
      <View style={ir.right}>
        <View style={ir.badge}>
          <Text style={ir.badgeTxt}>x {item.quantity}</Text>
        </View>
        <Text style={ir.total}>{formatOrderPrice(total)}</Text>
      </View>
    </View>
  );
};

const ir = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  img:       { width: 72, height: 72, borderRadius: 10, backgroundColor: '#F3F4F6', flexShrink: 0 },
  avatar:    { width: 72, height: 72, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontSize: 24, fontWeight: '700', color: '#fff' },
  info:      { flex: 1, gap: 3 },
  name:      { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  variant:   { fontSize: 12, color: Colors.textSecondary },
  unitPrice: { fontSize: 12, color: Colors.textSecondary },
  right:     { alignItems: 'flex-end', gap: 6 },
  badge:     { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: ORANGE_LIGHT, borderRadius: 6 },
  badgeTxt:  { fontSize: 12, fontWeight: '700', color: ORANGE },
  total:     { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});

// ─── Card + SectionHeader helpers ────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[cd.wrap, style]}>{children}</View>
);
const cd = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     '#E8EAF0',
    overflow:        'hidden',
    marginBottom:    14,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    4,
    elevation:       2,
  },
});

const SectionHeader: React.FC<{
  icon:   React.ReactNode;
  title:  string;
  right?: React.ReactNode;
  style?: any;
}> = ({ icon, title, right, style }) => (
  <View style={[sdh.row, style]}>
    {icon}
    <Text style={sdh.title}>{title}</Text>
    {right ?? null}
  </View>
);
const sdh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  title: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { orderId } = route.params;

  const [order,      setOrder]      = useState<OrderDetail | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get(`/orders/${orderId}`);
      const raw = data.data?.order ?? data.data;
      setOrder(mapOrder(raw));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // ── Cancel order ───────────────────────────────────────────────────────────
  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text:  'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await API.patch(`/orders/${orderId}/cancel`);
              await fetchOrder();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to cancel. Please try again.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleViewOnMap = () => {
    if (!order) return;
    const { shippingAddress: a } = order;
    const q = encodeURIComponent(
      [a.street, a.city, a.state, a.postalCode].filter(Boolean).join(', '),
    );
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  const handleContactSupport = () => {
    Linking.openURL('tel:+9609999999'); // ← replace with your support number
  };

  const handleInvoiceInfo = () => {
    Alert.alert(
      'Invoice',
      'Since this is a Cash on Delivery order, a digital invoice is not generated automatically. Contact support to request a receipt.',
      [
        { text: 'Contact Support', onPress: handleContactSupport },
        { text: 'OK', style: 'cancel' },
      ],
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Order Details</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Order Details</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>
        <View style={s.centered}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text style={s.errorTitle}>Couldn't load order</Text>
          <Text style={s.errorSub}>{error ?? 'Order not found'}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={fetchOrder}>
            <RefreshCw size={16} color="#fff" strokeWidth={2} />
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const meta        = STATUS_META[order.status] ?? STATUS_META.pending;
  const displayId   = `#ORD-${shortOrderId(order.id).toUpperCase()}`;
  const canCancel   = ['pending', 'confirmed'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const addr        = order.shippingAddress;
  const addrStr     = [addr.street, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ');
  const invoiceRef  = `INV-${shortOrderId(order.id).toUpperCase()}`;

  const itemsSubtotal  = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const subtotal       = order.subtotal > 0 ? order.subtotal : itemsSubtotal;
  const discount       = order.discount    ?? 0;
  const deliveryFee    = order.deliveryFee ?? SHIPPING;
  const total          = subtotal - discount + deliveryFee;

  // COD payment status
  const payStatusLabel = isDelivered
    ? 'Collected'
    : isCancelled
    ? 'Cancelled'
    : 'Pending';
  const payStatusColor = isDelivered
    ? GREEN
    : isCancelled
    ? RED
    : '#D97706';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Order Details</Text>
          <Text style={s.headerOrderId}>Order ID: {displayId}</Text>
        </View>

        <TouchableOpacity
          style={s.helpBtn}
          onPress={handleContactSupport}
          activeOpacity={0.75}
        >
          <Headphones size={15} color={ORANGE} strokeWidth={2} />
          <Text style={s.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Status + Timeline ── */}
        <Card>
          {/* Status row */}
          <View style={s.statusRow}>
            {/* Icon bubble */}
            <View style={[s.statusBubble, { backgroundColor: meta.bg }]}>
              <View style={[s.statusInner, { backgroundColor: meta.color }]}>
                {isDelivered ? (
                  <Check size={20} color="#fff" strokeWidth={3.5} />
                ) : isCancelled ? (
                  <X size={20} color="#fff" strokeWidth={3} />
                ) : (
                  <Package size={20} color="#fff" strokeWidth={2} />
                )}
              </View>
            </View>

            {/* Text block */}
            <View style={{ flex: 1 }}>
              <Text style={[s.statusLabel, { color: meta.color }]}>{meta.label}</Text>
              <Text style={s.statusDesc}>{meta.desc}</Text>
              <Text style={s.statusDate}>
                {formatOrderDate(order.updatedAt)}  ·  {formatOrderTime(order.updatedAt)}
              </Text>
            </View>

            {/* Cancel button — only for cancellable statuses */}
            {canCancel && (
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={handleCancelOrder}
                disabled={cancelling}
                activeOpacity={0.8}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <>
                    <Trash2 size={13} color={RED} strokeWidth={2} />
                    <Text style={s.cancelBtnText}>Cancel{'\n'}Order</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Animated timeline (hidden when cancelled) */}
          {!isCancelled && (
            <StatusTimeline
              status={order.status}
              statusHistory={order.statusHistory}
              createdAt={order.createdAt}
            />
          )}
        </Card>

        {/* ── 2. Delivery Address ── */}
        <Card>
          <View style={s.addrHeader}>
            <View style={s.addrHeaderLeft}>
              <MapPin size={16} color={ORANGE} strokeWidth={2} />
              <Text style={s.cardTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity
              style={s.mapBtn}
              onPress={handleViewOnMap}
              activeOpacity={0.8}
            >
              <MapPin size={12} color={ORANGE} strokeWidth={2} />
              <Text style={s.mapBtnText}>View on Map</Text>
            </TouchableOpacity>
          </View>
          <View style={s.addrBody}>
            {!!addr.fullName && (
              <Text style={s.addrName}>{addr.fullName}</Text>
            )}
            <Text style={s.addrLine}>{addrStr}</Text>
            {!!addr.phone && (
              <TouchableOpacity
                style={s.phoneRow}
                onPress={() => Linking.openURL(`tel:${addr.phone}`)}
                activeOpacity={0.75}
              >
                <Phone size={13} color={ORANGE} strokeWidth={2} />
                <Text style={s.phoneText}>{addr.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* ── 3. Order Items ── */}
        <Card>
          <SectionHeader
            icon={<ShoppingBag size={16} color={ORANGE} strokeWidth={2} />}
            title={`Order Items (${order.items.length})`}
          />
          {order.items.map((item, idx) => (
            <ItemRow
              key={`${item.product.id}::${item.unit}::${idx}`}
              item={item}
              idx={idx}
              isLast={idx === order.items.length - 1}
            />
          ))}
        </Card>

        {/* ── 4. Order Summary ── */}
        <Card style={{ padding: 16 }}>
          <SectionHeader
            icon={<FileText size={16} color={ORANGE} strokeWidth={2} />}
            title="Order Summary"
            style={{ padding: 0, borderBottom: 'none', borderBottomWidth: 0, marginBottom: 16 }}
          />

          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Subtotal ({order.items.length} items)</Text>
            <Text style={s.priceValue}>{formatOrderPrice(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Discount</Text>
              <Text style={[s.priceValue, { color: GREEN }]}>
                - {formatOrderPrice(discount)}
              </Text>
            </View>
          )}

          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Delivery Fee</Text>
            <Text style={s.priceValue}>{formatOrderPrice(deliveryFee)}</Text>
          </View>

          <View style={s.priceDivider} />

          <View style={[s.priceRow, { alignItems: 'flex-end' }]}>
            <View>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.paidVia}>
                Paid via {order.paymentMethod || 'Cash on Delivery'}
              </Text>
            </View>
            <View style={s.totalRight}>
              <Text style={s.totalCurrency}>MVR</Text>
              <Text style={s.totalAmount}>{total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* ── 5. Order Information (2×2 grid) ── */}
        <Card>
          <SectionHeader
            icon={<ClipboardList size={16} color={ORANGE} strokeWidth={2} />}
            title="Order Information"
          />

          <View style={s.infoGrid}>
            {/* Payment Method */}
            <View style={[s.infoCell, s.cellBR, s.cellBB]}>
              <View style={s.cellIconWrap}>
                <CreditCard size={18} color={Colors.textSecondary} strokeWidth={1.8} />
              </View>
              <Text style={s.cellLabel}>Payment Method</Text>
              <Text style={s.cellValue}>Cash on Delivery</Text>
            </View>

            {/* Invoice */}
            <TouchableOpacity
              style={[s.infoCell, s.cellBB]}
              onPress={handleInvoiceInfo}
              activeOpacity={0.75}
            >
              <View style={s.cellIconWrap}>
                <FileText size={18} color={Colors.textSecondary} strokeWidth={1.8} />
              </View>
              <Text style={s.cellLabel}>Invoice</Text>
              <Text style={s.cellValue} numberOfLines={1}>{invoiceRef}</Text>
              <Text style={[s.cellSub, { color: ORANGE }]}>
                Request receipt  ›
              </Text>
            </TouchableOpacity>

            {/* Payment Status */}
            <View style={[s.infoCell, s.cellBR]}>
              <View style={s.cellIconWrap}>
                <View
                  style={[
                    s.payDot,
                    { backgroundColor: payStatusColor },
                  ]}
                />
              </View>
              <Text style={s.cellLabel}>Payment Status</Text>
              <Text style={[s.cellValue, { color: payStatusColor }]}>
                {payStatusLabel}
              </Text>
              <Text style={s.cellSub}>Cash on Delivery</Text>
            </View>

            {/* Need Help */}
            <TouchableOpacity
              style={s.infoCell}
              onPress={handleContactSupport}
              activeOpacity={0.75}
            >
              <View style={s.cellIconWrap}>
                <Headphones size={18} color={Colors.textSecondary} strokeWidth={1.8} />
              </View>
              <Text style={s.cellLabel}>Need Help?</Text>
              <Text style={[s.cellValue, { color: ORANGE }]}>
                Contact Support
              </Text>
              <Text style={[s.cellSub, { color: ORANGE }]}>Tap to call  ›</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6FA' },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },

  // Header
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:  Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  headerCenter:  { alignItems: 'center', gap: 1 },
  headerTitle:   { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerOrderId: { fontSize: 12, fontWeight: '700', color: ORANGE },
  helpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: ORANGE + '40',
    backgroundColor: ORANGE_LIGHT,
  },
  helpText: { fontSize: 12, fontWeight: '700', color: ORANGE },

  // Status card
  statusRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    padding:       14,
    gap:           12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F1F5',
  },
  statusBubble: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statusInner: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  statusLabel: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statusDesc:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  statusDate:  { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1.5, borderColor: RED,
    flexShrink: 0, alignSelf: 'flex-start',
  },
  cancelBtnText: { fontSize: 11, fontWeight: '700', color: RED, textAlign: 'center', lineHeight: 14 },

  // Delivery address
  addrHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems:    'center', padding: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  addrHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle:      { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: ORANGE + '50',
    backgroundColor: ORANGE_LIGHT,
  },
  mapBtnText: { fontSize: 12, fontWeight: '600', color: ORANGE },
  addrBody:   { padding: 14, paddingTop: 12, gap: 4 },
  addrName:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  addrLine:   { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  phoneRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  phoneText:  { fontSize: 13, fontWeight: '600', color: ORANGE },

  // Price rows
  priceRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel:   { fontSize: 13, color: Colors.textSecondary },
  priceValue:   { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  priceDivider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  paidVia:      { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  totalRight:   { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  totalCurrency:{ fontSize: 14, fontWeight: '700', color: ORANGE, paddingBottom: 5 },
  totalAmount:  { fontSize: 30, fontWeight: '800', color: ORANGE, letterSpacing: -0.5 },

  // Error
  errorTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  errorSub:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ORANGE, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 8,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Info grid (2×2)
  infoGrid:  { flexDirection: 'row', flexWrap: 'wrap' },
  infoCell:  { width: '50%', padding: 14, gap: 5 },
  cellBR:    { borderRightWidth: 0.5,  borderRightColor:  Colors.border },
  cellBB:    { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  cellIconWrap: { marginBottom: 2 },
  cellLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  cellValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cellSub:   { fontSize: 11, color: Colors.textSecondary },
  payDot:    { width: 16, height: 16, borderRadius: 8 },
});