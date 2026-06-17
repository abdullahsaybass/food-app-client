/**
 * OrderDetailScreen.tsx  — redesigned to match reference UI
 *
 * Layout:
 *  - Header: back arrow + "Order Details" title + headphone icon
 *  - Dark navy card: Order ID + copy icon + Delivered badge + date range
 *  - 4-step timeline inside the navy card (Placed → Confirmed → Out for Delivery → Delivered)
 *  - Delivery Address card
 *  - Order Items card with "View Details" toggle
 *  - Order Summary card (subtotal / delivery / discount / total + payment method)
 *  - Bottom CTA: Download Invoice (outline) + Reorder (solid dark)
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
  Modal,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';

import { API }             from '../../../app/lib/api';
import { orderService }    from '../services/order.service';
import { useOrderStore }   from '../store/order.store';
import { Colors, FontFamily, Typography } from '../../../theme';
import {
  formatOrderDate,
  formatOrderTime,
  formatOrderPrice,
  shortOrderId,
} from '../utils/order.utils';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type Route = RouteProp<RootStackParamList, 'OrderDetail'>;

// ─── Constants ────────────────────────────────────────────────────────────────
const GREEN       = '#16A34A';
const GREEN_LIGHT = '#F0FDF4';
const NAVY        = '#111827';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
  | 'pending' | 'confirmed' | 'packing'
  | 'out_for_delivery' | 'delivered' | 'cancelled';

interface StatusHistoryEntry { status: OrderStatus; statusLabel?: string; note?: string | null; at: string; }

interface OrderDetailItem {
  product: { id: string; name: string; image: string };
  unit: string; quantity: number; price: number;
}

interface OrderDetail {
  id: string; status: OrderStatus;
  items: OrderDetailItem[];
  totalAmount: number; subtotal: number; discount: number; deliveryFee: number;
  paymentMethod: string;
  orderNumber: string;
  paymentStatus: string;
  statusTimeline: StatusHistoryEntry[];
  estimatedDeliveryAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  shippingAddress: { fullName: string; phone: string; street: string; city: string; state?: string; zip?: string; };
  createdAt: string; updatedAt: string;
}

// ─── Backend mapper ───────────────────────────────────────────────────────────
const mapOrder = (raw: any): OrderDetail => ({
  id:     raw._id ?? raw.id ?? '',
  status: raw.status ?? 'pending',
  items: (raw.items ?? []).map((i: any) => ({
    product: {
      id:    i.product?._id ?? i.product?.id ?? '',
      name:  i.product?.name ?? i.name ?? '',
      image: (() => { const img = i.product?.image ?? i.image; if (!img) return ''; if (typeof img === 'string') return img; return img.url ?? img.uri ?? ''; })(),
    },
    unit: i.unit ?? '', quantity: i.quantity ?? 1, price: i.price ?? 0,
  })),
  totalAmount: raw.totalAmount ?? 0,
  subtotal:    raw.subtotal ?? raw.totalAmount ?? 0,
  discount:    raw.discount ?? 0,
  deliveryFee: raw.deliveryCharge ?? raw.deliveryFee ?? raw.shippingFee ?? raw.shipping ?? 0,
  paymentMethod: raw.paymentMethod ?? 'Cash on Delivery',
  orderNumber: raw.orderNumber ?? '',
  paymentStatus: raw.paymentStatus ?? 'pending',
  statusTimeline: (raw.statusTimeline ?? []).map((e: any) => ({ status: e.status, statusLabel: e.statusLabel ?? e.status, note: e.note ?? null, at: e.at ?? '' })),
  estimatedDeliveryAt: raw.estimatedDeliveryAt ?? null,
  cancelledBy: raw.cancelledBy ?? null,
  cancelReason: raw.cancelReason ?? null,
  shippingAddress: {
    fullName:   raw.shippingAddress?.fullName ?? '',
    phone:      raw.shippingAddress?.phone ?? '',
    street:     raw.shippingAddress?.street ?? '',
    city:       raw.shippingAddress?.city ?? '',
    state:      raw.shippingAddress?.state,
    zip: raw.shippingAddress?.zip ?? '',
  },
  createdAt: raw.createdAt ?? '',
  updatedAt: raw.updatedAt ?? '',
});

// ─── Status step map ──────────────────────────────────────────────────────────
const STATUS_STEP: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, packing: 2,
  out_for_delivery: 3, delivered: 4, cancelled: -1,
};

// Timeline steps — 5 steps matching new order flow
const STEPS = [
  { label: 'Order\nPlaced',      key: ['pending'] as OrderStatus[]           },
  { label: 'Confirmed',          key: ['confirmed'] as OrderStatus[]          },
  { label: 'Packing',            key: ['packing'] as OrderStatus[]            },
  { label: 'Out for\nDelivery',  key: ['out_for_delivery'] as OrderStatus[]   },
  { label: 'Delivered',          key: ['delivered'] as OrderStatus[]          },
];

const getStepTs = (history: StatusHistoryEntry[], keys: OrderStatus[], createdAt: string, idx: number): string | null => {
  const found = history.find(h => (keys as string[]).includes(h.status));
  if (found) return found.at;
  return idx === 0 ? createdAt : null;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcoArrowLeft = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoHeadphones = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="#111" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke="#111" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoCopy = ({ color = '#aaa' }: { color?: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Rect x={9} y={9} width={13} height={13} rx={2} stroke={color} strokeWidth={1.8}/>
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);
const IcoCheck = ({ color = '#fff', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoMapPin = ({ color = GREEN }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8}/>
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={1.8}/>
  </Svg>
);
const IcoMapOutline = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Polyline points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke={GREEN} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1={8} y1={2} x2={8} y2={18} stroke={GREEN} strokeWidth={1.8}/>
    <Line x1={16} y1={6} x2={16} y2={22} stroke={GREEN} strokeWidth={1.8}/>
  </Svg>
);
const IcoChevronDown = ({ color = GREEN }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoChevronUp = ({ color = GREEN }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoRefresh = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4v6h-6" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const IcoCancel = ({ color = '#EF4444' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2}/>
    <Line x1={15} y1={9} x2={9} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Line x1={9} y1={9} x2={15} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);
const IcoSupport = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Timeline inside navy card ────────────────────────────────────────────────
const NavyTimeline: React.FC<{
  status: OrderStatus;
  statusTimeline: StatusHistoryEntry[];
  createdAt: string;
}> = ({ status, statusTimeline: statusHistory, createdAt }) => {
  const currentStep = STATUS_STEP[status] ?? 0;
  const isDelivered = status === 'delivered';

  const segAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const fills = segAnims.slice(0, currentStep).map((anim, i) =>
      Animated.timing(anim, { toValue: 1, duration: 450, delay: i * 180, useNativeDriver: false })
    );
    Animated.parallel(fills).start();
  }, [currentStep]);

  return (
    <View style={tl.wrapper}>
      {STEPS.map((step, idx) => {
        const done   = idx < currentStep || isDelivered;
        const active = !isDelivered && idx === currentStep && status !== 'cancelled';
        const ts     = getStepTs(statusHistory, step.key, createdAt, idx);

        return (
          <React.Fragment key={step.label}>
            <View style={tl.col}>
              {/* Node */}
              <View style={[
                tl.node,
                done  && tl.nodeDone,
                active && tl.nodeActive,
                !done && !active && tl.nodeInactive,
              ]}>
                {done ? (
                  <IcoCheck color="#fff" size={13} />
                ) : active ? (
                  // active: truck / clipboard icon approximated as circle
                  <View style={tl.activeDot} />
                ) : (
                  <View style={tl.inactiveDot} />
                )}
              </View>
              <Text style={[tl.label, (done || active) && tl.labelActive]}>
                {step.label}
              </Text>
              {ts ? <Text style={tl.time}>{formatOrderTime(ts)}</Text> : null}
            </View>

            {idx < 4 && (
              <View style={tl.seg}>
                <Animated.View style={[
                  tl.segFill,
                  {
                    width: segAnims[idx].interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }),
                  }
                ]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const tl = StyleSheet.create({
  wrapper:       { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
  col:           { alignItems: 'center', width: 58, gap: 5 },
  node: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  nodeDone:     { backgroundColor: GREEN, borderColor: GREEN },
  nodeActive:   { backgroundColor: 'transparent', borderColor: GREEN },
  nodeInactive: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)' },
  activeDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  inactiveDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  label:        { fontFamily: FontFamily.medium, fontSize: 9, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 12 },
  labelActive:  { fontFamily: FontFamily.bold, color: '#fff' },
  time:         { fontFamily: FontFamily.medium, fontSize: 8, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  seg: {
    flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1, marginTop: 17, overflow: 'hidden',
  },
  segFill:  { height: '100%', backgroundColor: GREEN, borderRadius: 1 },
});

// ─── Item row ─────────────────────────────────────────────────────────────────
const ItemRow: React.FC<{ item: OrderDetailItem; isLast?: boolean }> = ({ item, isLast }) => (
  <View style={[ir.row, !isLast && ir.border]}>
    {item.product.image ? (
      <Image source={{ uri: item.product.image }} style={ir.img} resizeMode="cover" />
    ) : (
      <View style={ir.placeholder} />
    )}
    <View style={ir.info}>
      <Text style={ir.name} numberOfLines={2}>{item.product.name}</Text>
      <Text style={ir.variant}>{item.unit}</Text>
      <View style={ir.priceBadge}>
        <Text style={ir.priceBadgeTxt}>{formatOrderPrice(item.price)}</Text>
      </View>
    </View>
    <View style={ir.right}>
      <Text style={ir.lineTotal}>{formatOrderPrice(item.price * item.quantity)}</Text>
      <Text style={ir.qty}>Qty: {item.quantity}</Text>
    </View>
  </View>
);

const ir = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  border:      { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  img:         { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5F5F5' },
  placeholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F0F0F0' },
  info:        { flex: 1, gap: 3 },
  name:        { fontFamily: FontFamily.semiBold, fontSize: 14, color: '#111', lineHeight: 19 },
  variant:     { fontFamily: FontFamily.regular, fontSize: 12, color: '#888' },
  priceBadge: {
    alignSelf: 'flex-start', marginTop: 2,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: GREEN_LIGHT, borderRadius: 8,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  priceBadgeTxt: { fontFamily: FontFamily.bold, fontSize: 11, color: GREEN },
  right:         { alignItems: 'flex-end', gap: 4 },
  lineTotal:     { fontFamily: FontFamily.bold, fontSize: 14, color: '#111' },
  qty:           { fontFamily: FontFamily.regular, fontSize: 12, color: '#888' },
});

// ─── Summary row ──────────────────────────────────────────────────────────────
const SumRow: React.FC<{ label: string; value: string; isDiscount?: boolean; isBold?: boolean }> = ({ label, value, isDiscount, isBold }) => (
  <View style={su.row}>
    <Text style={[su.label, isBold && su.labelBold, isDiscount && { color: GREEN, fontWeight: '600' }]}>{label}</Text>
    <Text style={[su.value, isBold && su.valueBold, isDiscount && { color: '#EF4444', fontWeight: '700' }]}>{value}</Text>
  </View>
);
const su = StyleSheet.create({
  row:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label:     { fontFamily: FontFamily.regular, fontSize: 14, color: '#555' },
  labelBold: { fontFamily: FontFamily.bold, fontSize: 15, color: '#111' },
  value:     { fontFamily: FontFamily.medium, fontSize: 14, color: '#111' },
  valueBold: { fontFamily: FontFamily.extraBold, fontSize: 18, color: GREEN },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { orderId } = route.params;

  const [order,   setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [showItems, setShowItems] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reordering, setReordering] = useState(false);

  const reorderAction = useOrderStore(s => s.reorder);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true); setError(null);
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

  const handleViewOnMap = () => {
    if (!order) return;
    const a = order.shippingAddress;
    const q = encodeURIComponent([a.street, a.city, a.state, a.zip].filter(Boolean).join(', '));
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed'];

  const handleCancelOrder = () => setShowCancelModal(true);

  const confirmCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const updated = await orderService.cancelOrder(order.id);
      setOrder(prev => prev ? { ...prev, status: updated.status as OrderStatus } : prev);
      setShowCancelModal(false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@vfresh.com?subject=Order%20Support%20-%20' + shortOrderId(order?.id ?? ''));
  };

  const handleReorder = async () => {
    if (!order) return;
    try {
      setReordering(true);
      const success = await reorderAction(order.id);
      if (success) {
        Alert.alert('Added to Cart', 'Items from this order have been added to your cart.', [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Error', 'Failed to reorder. Please try again.');
      }
    } finally {
      setReordering(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}><IcoArrowLeft /></TouchableOpacity>
        <Text style={s.headerTitle}>Order Details</Text>
        <View style={s.iconBtn}><IcoHeadphones /></View>
      </View>
      <View style={s.centered}><ActivityIndicator size="large" color={GREEN} /></View>
    </SafeAreaView>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !order) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}><IcoArrowLeft /></TouchableOpacity>
        <Text style={s.headerTitle}>Order Details</Text>
        <View style={s.iconBtn}><IcoHeadphones /></View>
      </View>
      <View style={s.centered}>
        <Text style={{ fontSize: 42 }}>😕</Text>
        <Text style={s.errorTitle}>Couldn't load order</Text>
        <Text style={s.errorSub}>{error ?? 'Order not found'}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchOrder}>
          <IcoRefresh />
          <Text style={s.retryTxt}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Derived values ─────────────────────────────────────────────────────────
  const displayId  = `#ORD-${shortOrderId(order.id)}`;
  const isDelivered = order.status === 'delivered';
  const addr        = order.shippingAddress;
  const addrLine    = [addr.street, addr.city].filter(Boolean).join(', ');
  const addrFull    = [addrLine, addr.state, addr.zip].filter(Boolean).join(' ');
  const subtotal    = order.subtotal > 0 ? order.subtotal : order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount    = order.discount ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const total       = subtotal - discount + deliveryFee;
  const placedAt    = formatOrderDate(order.createdAt) + ' • ' + formatOrderTime(order.createdAt);
  const deliveredAt = isDelivered && order.statusTimeline.length
    ? (() => { const h = order.statusTimeline.find(h => h.status === 'delivered'); return h ? formatOrderDate(h.at) + ' • ' + formatOrderTime(h.at) : ''; })()
    : '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <IcoArrowLeft />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Order Details</Text>
        <TouchableOpacity style={s.iconBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <IcoHeadphones />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* ── Navy card: order ID + status + timeline ── */}
        <View style={s.navyCard}>
          {/* Top row: order ID + delivered badge */}
          <View style={s.navyTop}>
            <View>
              <View style={s.orderIdRow}>
                <Text style={s.orderIdLabel}>Order ID</Text>
                <TouchableOpacity
                  onPress={() => { try { Clipboard.setString(displayId); } catch {} }}
                  hitSlop={{top:6,bottom:6,left:6,right:6}}
                >
                  <IcoCopy color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
              <Text style={s.orderId}>{displayId}</Text>
              <Text style={s.navyDate}>{placedAt}</Text>
            </View>
            <View>
              <View style={[s.statusBadge, isDelivered && s.statusBadgeGreen]}>
                {isDelivered && <IcoCheck color={GREEN} size={12} />}
                <Text style={[s.statusBadgeTxt, isDelivered && { color: '#fff' }]}>
                  {isDelivered ? 'Delivered' : order.status.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                </Text>
              </View>
              {deliveredAt ? <Text style={s.deliveredAt}>{deliveredAt}</Text> : null}
            </View>
          </View>

          {/* Divider */}
          <View style={s.navyDivider} />

          {/* Timeline */}
          <NavyTimeline
            status={order.status}
            statusTimeline={order.statusTimeline}
            createdAt={order.createdAt}
          />
        </View>

        {/* ── Delivery Address ── */}
        <View style={s.card}>
          <View style={s.itemsHeader}>
            <Text style={s.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity style={s.mapBtn} onPress={handleViewOnMap} activeOpacity={0.8}>
              <IcoMapOutline />
              <Text style={s.mapBtnTxt}>View on Map</Text>
            </TouchableOpacity>
          </View>
          <View style={s.addrRow}>
            <View style={s.addrIconWrap}>
              <IcoMapPin color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              {!!addr.fullName && <Text style={s.addrName}>{addr.fullName}</Text>}
              <Text style={s.addrLine}>{addrFull}</Text>
              {!!addr.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${addr.phone}`)}>
                  <Text style={s.addrPhone}>{addr.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Order Items ── */}
        <View style={s.card}>
          <View style={s.itemsHeader}>
            <Text style={s.sectionTitle}>Order Items ({order.items.length})</Text>
            <TouchableOpacity style={s.viewDetailBtn} onPress={() => setShowItems(v => !v)} activeOpacity={0.7}>
              <Text style={s.viewDetailTxt}>View Details</Text>
              {showItems ? <IcoChevronUp /> : <IcoChevronDown />}
            </TouchableOpacity>
          </View>
          {showItems && order.items.map((item, idx) => (
            <ItemRow key={`${item.product.id}::${idx}`} item={item} isLast={idx === order.items.length - 1} />
          ))}
        </View>

        {/* ── Order Summary ── */}
        <View style={[s.card, { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }]}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={[s.summaryDivider, { marginTop: 12, marginBottom: 14 }]} />
          <SumRow label="Subtotal" value={formatOrderPrice(subtotal)} />
          <SumRow label="Delivery Fee" value={deliveryFee > 0 ? formatOrderPrice(deliveryFee) : 'FREE'} />
          <SumRow label="Discount" value={discount > 0 ? `- ${formatOrderPrice(discount)}` : '—'} isDiscount={discount > 0} />
          <View style={s.summaryDivider} />
          <View style={s.totalRow}>
            <View>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.paidVia}>Paid via {order.paymentMethod || 'Cash on Delivery'}</Text>
            </View>
            <Text style={s.totalAmount}>{formatOrderPrice(total)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom CTAs ── */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {CANCELLABLE.includes(order.status) && (
          <TouchableOpacity
            style={[s.invoiceBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancelOrder}
            disabled={cancelling}
            activeOpacity={0.85}
          >
            {cancelling
              ? <ActivityIndicator size="small" color="#EF4444" />
              : <IcoCancel />}
            <Text style={[s.invoiceBtnTxt, { color: '#EF4444' }]}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.reorderBtn} onPress={handleReorder} disabled={reordering} activeOpacity={0.85}>
          {reordering
            ? <ActivityIndicator size="small" color="#fff" />
            : <IcoRefresh />}
          <Text style={s.reorderBtnTxt}>{reordering ? 'Adding…' : 'Reorder'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Cancel Order Modal ── */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => !cancelling && setShowCancelModal(false)}
      >
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.iconCircle}>
              <IcoCancel color="#EF4444" />
            </View>
            <Text style={cm.title}>Cancel this order?</Text>
            <Text style={cm.subtitle}>
              This action can't be undone. Your order {displayId} will be cancelled and no longer processed.
            </Text>

            <TouchableOpacity
              style={[cm.confirmBtn, cancelling && { opacity: 0.6 }]}
              onPress={confirmCancelOrder}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              {cancelling
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={cm.confirmBtnTxt}>Yes, Cancel Order</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={cm.keepBtn}
              onPress={() => setShowCancelModal(false)}
              disabled={cancelling}
              activeOpacity={0.7}
            >
              <Text style={cm.keepBtnTxt}>Keep Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Cancel Modal Styles ────────────────────────────────────────────────────
const cm = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheet: {
    width: '100%', maxWidth: 360,
    backgroundColor: '#fff', borderRadius: 24,
    paddingTop: 28, paddingHorizontal: 24, paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: FontFamily.extraBold, fontSize: 18, color: '#111', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 13.5, color: '#777', lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  confirmBtn: {
    width: '100%', height: 50, borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  confirmBtnTxt: { fontFamily: FontFamily.bold, fontSize: 15, color: '#fff' },
  keepBtn: {
    width: '100%', height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },
  keepBtnTxt: { fontFamily: FontFamily.bold, fontSize: 15, color: '#111' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6FA' },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  iconBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: '#111', letterSpacing: -0.3 },

  // Navy card
  navyCard: {
    backgroundColor: NAVY,
    borderRadius: 8,
    margin: 16,
    overflow: 'hidden',
  },
  navyTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, paddingBottom: 16,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  orderIdLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  orderId:     { fontFamily: FontFamily.extraBold, fontSize: 20, color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  navyDate:    { fontFamily: FontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  statusBadgeGreen: { backgroundColor: GREEN },
  statusBadgeTxt:   { fontFamily: FontFamily.bold, fontSize: 13, color: '#111' },
  deliveredAt:      { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, textAlign: 'right' },
  navyDivider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 8,
    marginHorizontal: 16, marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#EFEFEF',
  },

  // Address
  addrRow:    { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  addrIconWrap: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    alignSelf: 'center',
  },
  addrName:  { fontFamily: FontFamily.bold, fontSize: 15, color: '#111', marginBottom: 2 },
  addrLine:  { fontFamily: FontFamily.regular, fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 2 },
  addrPhone: { fontFamily: FontFamily.semiBold, fontSize: 13, color: GREEN, marginTop: 2 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#BBF7D0',
    backgroundColor: GREEN_LIGHT, flexShrink: 0,
    alignSelf: 'flex-start',
  },
  mapBtnTxt: { fontFamily: FontFamily.semiBold, fontSize: 12, color: GREEN },

  // Items
  itemsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  sectionTitle:  { fontFamily: FontFamily.bold, fontSize: 15, color: '#111' },
  viewDetailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailTxt: { fontFamily: FontFamily.semiBold, fontSize: 13, color: GREEN },

  // Summary
  summaryDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12, marginHorizontal: -20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:  { fontFamily: FontFamily.bold, fontSize: 16, color: '#111' },
  paidVia:     { fontFamily: FontFamily.regular, fontSize: 12, color: '#888', marginTop: 2 },
  totalAmount: { fontFamily: FontFamily.extraBold, fontSize: 22, color: GREEN },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  invoiceBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#EF4444', backgroundColor: '#fff',
  },
  invoiceBtnTxt: { fontFamily: FontFamily.bold, fontSize: 14, color: GREEN },
  reorderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, borderRadius: 8, backgroundColor: '#111',
  },
  reorderBtnTxt: { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },

  // Error
  errorTitle: { fontFamily: FontFamily.bold, fontSize: 17, color: '#111', textAlign: 'center' },
  errorSub:   { fontFamily: FontFamily.regular, fontSize: 13, color: '#888', textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#111', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 8,
  },
  retryTxt: { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
});