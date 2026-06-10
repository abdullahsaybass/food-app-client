/**
 * OrderSuccess.screen.tsx
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Animated, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets }         from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp }           from '@react-navigation/native-stack';
import { Check, ShoppingBag, Package, List } from 'lucide-react-native';

import { Colors }                        from '../../../theme';
import { FontFamily }                    from '../../../theme/typography';
import { formatOrderPrice, shortOrderId } from '../utils/order.utils';
import { RingButton }                    from '../../../shared/components/Ringbutton.component';

import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'OrderSuccess'>;
type Route = RouteProp<RootStackParamList, 'OrderSuccess'>;

const GREEN       = '#2E7D32';
const GREEN_LIGHT = '#F0F7F0';
const BLACK       = '#111111';
const SHIPPING    = 0;

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI = [
  { color: '#2E7D32', top: 30,  left: 40,  size: 10, rotate: '20deg'  },
  { color: '#10B981', top: 60,  left: 20,  size: 8,  rotate: '-15deg' },
  { color: '#2E7D32', top: 20,  right: 50, size: 12, rotate: '45deg'  },
  { color: '#10B981', top: 55,  right: 25, size: 7,  rotate: '10deg'  },
  { color: '#4CAF50', top: 80,  left: 60,  size: 9,  rotate: '-30deg' },
  { color: '#2E7D32', top: 10,  left: 120, size: 6,  rotate: '60deg'  },
  { color: '#10B981', top: 90,  right: 70, size: 8,  rotate: '-45deg' },
  { color: '#4CAF50', top: 40,  right: 110,size: 10, rotate: '25deg'  },
] as const;

// ─── Animated check hero ──────────────────────────────────────────────────────
const HeroCheck: React.FC = () => {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={hero.container}>
      {CONFETTI.map((c, i) => (
        <View
          key={i}
          style={[
            hero.confetti,
            {
              backgroundColor: c.color,
              width: c.size, height: c.size * 0.55,
              borderRadius: 2,
              top: c.top,
              ...(('left'  in c) ? { left:  (c as any).left  } : {}),
              ...(('right' in c) ? { right: (c as any).right } : {}),
              transform: [{ rotate: c.rotate }],
            },
          ]}
        />
      ))}
      <View style={hero.outerRing}>
        <Animated.View style={[hero.circle, { transform: [{ scale }] }]}>
          <Check size={38} color="#fff" strokeWidth={3.5} />
        </Animated.View>
      </View>
    </View>
  );
};

const hero = StyleSheet.create({
  container: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  confetti:  { position: 'absolute' },
  outerRing: { width: 130, height: 130, borderRadius: 65, backgroundColor: GREEN_LIGHT, alignItems: 'center', justifyContent: 'center' },
  circle:    { width: 96, height: 96, borderRadius: 48, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
});

// ─── Item row ─────────────────────────────────────────────────────────────────
const ITEM_COLORS = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'];

const ItemRow: React.FC<{
  name: string; variant: string; qty: number; total: number;
  colorIdx: number; imageUrl?: string; isLast?: boolean;
}> = ({ name, variant, qty, total, colorIdx, imageUrl, isLast }) => {
  const bg = ITEM_COLORS[colorIdx % ITEM_COLORS.length];
  return (
    <View style={[ir.row, !isLast && ir.rowBorder]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={ir.img} resizeMode="cover" />
      ) : (
        <View style={[ir.avatar, { backgroundColor: bg }]}>
          <Text style={ir.avatarTxt}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={ir.info}>
        <Text style={ir.name} numberOfLines={1}>{name}</Text>
        <Text style={ir.variant}>{variant}</Text>
      </View>
      <View style={ir.badge}><Text style={ir.badgeTxt}>x {qty}</Text></View>
      <Text style={ir.price}>MVR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
    </View>
  );
};

const ir = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  img:       { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6' },
  avatar:    { width: 64, height: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 22, fontFamily: FontFamily.bold, color: '#fff' },
  info:      { flex: 1, gap: 3 },
  name:      { fontSize: 14, fontFamily: FontFamily.semiBold, color: Colors.textPrimary },
  variant:   { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  badge:     { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#F3F4F6', borderRadius: 6 },
  badgeTxt:  { fontSize: 12, fontFamily: FontFamily.semiBold, color: Colors.textSecondary },
  price:     { fontSize: 14, fontFamily: FontFamily.semiBold, color: Colors.textPrimary, minWidth: 80, textAlign: 'right' },
});

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[cd.wrap, style]}>{children}</View>
);
const cd = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden', marginBottom: 12 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();

  const {
    orderId,
    cartItems     = [],
    cartTotal,
    discount      = 0,
    paymentMethod = 'Cash on Delivery',
  } = route.params;

  const subtotal  = cartTotal;
  const total     = subtotal - discount + SHIPPING;
  const displayId = `#ORD-${shortOrderId(orderId).toUpperCase()}`;
  const now       = new Date();
  const dateStr   = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr   = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const goToOrders = () => navigation.navigate('OrderHistory');
  const goToHome   = () => navigation.navigate('MainTabs', { screen: 'Home' });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={s.heroSection}>
          <HeroCheck />
          <Text style={s.heroTitle}>Order Placed Successfully!</Text>
          <Text style={s.heroSub}>
            Thank you for shopping with us.{'\n'}Your order has been placed successfully.
          </Text>
        </View>

        {/* ── Order meta card ── */}
        <Card>
          <View style={s.metaRow}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Order ID</Text>
              <Text style={s.metaOrderId}>{displayId}</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Order Date &amp; Time</Text>
              <Text style={s.metaDate}>{dateStr}  ·  {timeStr}</Text>
            </View>
          </View>
        </Card>

        {/* ── Confirmation banner ── */}
        <Card>
          <View style={s.bannerRow}>
            <View style={s.bannerIconWrap}>
              <Package size={26} color={BLACK} strokeWidth={1.8} />
              <View style={s.bannerBadge}>
                <Check size={9} color="#fff" strokeWidth={3} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTitle}>Your order is confirmed!</Text>
              <Text style={s.bannerSub}>
                We've received your order and it has been successfully placed.
                You will receive a confirmation shortly.
              </Text>
            </View>
          </View>
        </Card>

        {/* ── Order Summary ── */}
        <Card style={{ padding: 16 }}>
          <View style={s.sectionHeaderRow}>
            <ShoppingBag size={18} color={BLACK} strokeWidth={2} />
            <Text style={s.sectionTitle}>Order Summary</Text>
          </View>
          <View style={{ height: 14 }} />

          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Subtotal ({cartItems.length} items)</Text>
            <Text style={s.priceValue}>MVR {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          {discount > 0 && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Discount</Text>
              <Text style={s.discountValue}>- MVR {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Delivery Fee</Text>
            <Text style={s.freeDelivery}>Free</Text>
          </View>
          <View style={s.divider} />
          <View style={s.priceRow}>
            <View>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.paidVia}>Paid via {paymentMethod}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
              <Text style={s.totalCurrency}>MVR</Text>
              <Text style={s.totalAmount}>{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </Card>

        {/* ── Items Ordered ── */}
        {cartItems.length > 0 && (
          <Card>
            <View style={[s.sectionHeaderRow, { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border }]}>
              <List size={18} color={BLACK} strokeWidth={2} />
              <Text style={[s.sectionTitle, { flex: 1 }]}>
                Items Ordered ({cartItems.length})
              </Text>
              <TouchableOpacity onPress={goToOrders} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={s.viewLink}>View Order Details</Text>
                <Text style={[s.viewLink, { fontSize: 14 }]}> ›</Text>
              </TouchableOpacity>
            </View>
            {cartItems.map((item: any, idx: number) => (
              <ItemRow
                key={`${item.product.id}::${item.selectedVariant.unit}`}
                name={item.product.name}
                variant={item.selectedVariant.unit}
                qty={item.quantity}
                total={item.selectedVariant.price * item.quantity}
                colorIdx={idx}
                imageUrl={item.product.imageUrl ?? item.product.image}
                isLast={idx === cartItems.length - 1}
              />
            ))}
          </Card>
        )}

        {/* ── What's Next / Need Help ── */}
        <Card>
          <View style={s.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>What's Next?</Text>
              <Text style={s.infoSub}>You will receive a confirmation with your order details.</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Need help?</Text>
              <Text style={s.infoSub}>Our support team is here for you.</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 8 }]}>
        <RingButton
          label="View Orders"
          variant="outline"
          color={GREEN}
          onComplete={goToOrders}
          icon={<List size={16} color={GREEN} strokeWidth={2} />}
          style={s.outlineBtn}
          textStyle={s.outlineBtnText}
        />
        <RingButton
          label="Continue Shopping"
          variant="solid"
          color={GREEN}
          onComplete={goToHome}
          icon={<ShoppingBag size={16} color="#fff" strokeWidth={2} />}
          style={s.primaryBtn}
          textStyle={s.primaryBtnText}
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F5F5F5' },
  heroSection:      { alignItems: 'center', paddingTop: 24, paddingBottom: 16, gap: 10 },
  heroTitle:        { fontSize: 22, fontFamily: FontFamily.extraBold, color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  heroSub:          { fontSize: 14, fontFamily: FontFamily.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  metaRow:          { flexDirection: 'row', padding: 16, alignItems: 'center' },
  metaCol:          { flex: 1, gap: 4 },
  metaDivider:      { width: 0.5, height: 40, backgroundColor: Colors.border, marginHorizontal: 12 },
  metaLabel:        { fontSize: 11, fontFamily: FontFamily.medium, color: Colors.textSecondary },
  metaOrderId:      { fontSize: 16, fontFamily: FontFamily.extraBold, color: BLACK, letterSpacing: 0.3 },
  metaDate:         { fontSize: 13, fontFamily: FontFamily.semiBold, color: Colors.textPrimary },
  bannerRow:        { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  bannerIconWrap:   { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bannerBadge:      { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  bannerTitle:      { fontSize: 15, fontFamily: FontFamily.bold, color: Colors.textPrimary, marginBottom: 4 },
  bannerSub:        { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.textSecondary, lineHeight: 18 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle:     { fontSize: 16, fontFamily: FontFamily.bold, color: Colors.textPrimary },
  priceRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel:       { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  priceValue:       { fontSize: 13, fontFamily: FontFamily.semiBold, color: Colors.textPrimary },
  discountValue:    { fontSize: 13, fontFamily: FontFamily.semiBold, color: Colors.textPrimary },
  freeDelivery:     { fontSize: 13, fontFamily: FontFamily.bold, color: Colors.textPrimary },
  divider:          { height: 0.5, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel:       { fontSize: 15, fontFamily: FontFamily.bold, color: Colors.textPrimary },
  paidVia:          { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginTop: 2 },
  totalCurrency:    { fontSize: 14, fontFamily: FontFamily.bold, color: BLACK, paddingBottom: 4 },
  totalAmount:      { fontSize: 28, fontFamily: FontFamily.extraBold, color: BLACK, letterSpacing: -0.5 },
  viewLink:         { fontSize: 13, fontFamily: FontFamily.semiBold, color: BLACK },
  infoRow:          { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  infoDivider:      { width: 0.5, height: 44, backgroundColor: Colors.border, marginHorizontal: 4 },
  infoTitle:        { fontSize: 13, fontFamily: FontFamily.bold, color: Colors.textPrimary, marginBottom: 2 },
  infoSub:          { fontSize: 11, fontFamily: FontFamily.regular, color: Colors.textSecondary, lineHeight: 16 },
  footer:           { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.border },
  outlineBtn:       { flex: 1, height: 50, borderRadius: 8, borderWidth: 1.5, borderColor: GREEN },
  outlineBtnText:   { fontSize: 14, fontFamily: FontFamily.bold, color: GREEN },
  primaryBtn:       { flex: 1, height: 50, borderRadius: 8, backgroundColor: GREEN },
  primaryBtnText:   { fontSize: 14, fontFamily: FontFamily.bold, color: '#fff' },
});