/**
 * Checkout.screen.tsx
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform, Image, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp }           from '@react-navigation/native-stack';
import { ArrowLeft, Check, AlertTriangle, Lock } from 'lucide-react-native';

import { Colors, FontFamily }      from '../../../theme';
import { useProductStore }         from '../../product/store/product.store';
import { useAuthStore }            from '../../auth/store/auth.store';
import { useOrderStore }           from '../store/order.store';
import { formatOrderPrice }        from '../utils/order.utils';
import { RingButton }              from '../../../shared/components/Ringbutton.component';
import type { DeliveryAddress }    from '../types/order.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

type Nav           = NativeStackNavigationProp<RootStackParamList>;
type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;

const PRIMARY       = '#111111';
const PRIMARY_LIGHT = '#4CAF50';
const PRIMARY_SURF  = '#F5F5F5';
const PRIMARY_DARK  = '#111111';
const NAVY          = '#1A1F2E';

// ─── Radio dot ────────────────────────────────────────────────────────────────
const RadioDot: React.FC<{ selected: boolean }> = ({ selected }) => (
  <View style={[rd.outer, selected && rd.outerSel]}>
    {selected ? <View style={rd.inner} /> : null}
  </View>
);
const rd = StyleSheet.create({
  outer:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  outerSel: { borderColor: PRIMARY },
  inner:    { width: 11, height: 11, borderRadius: 6, backgroundColor: PRIMARY },
});

// ─── Coming-Soon badge ────────────────────────────────────────────────────────
const ComingSoon: React.FC = () => (
  <View style={csb.wrap}><Text style={csb.text}>Coming Soon</Text></View>
);
const csb = StyleSheet.create({
  wrap: { backgroundColor: '#DCFCE7', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontFamily: FontFamily.bold, fontSize: 10, color: PRIMARY_DARK, letterSpacing: 0.3 },
});

// ─── Order Item Row ───────────────────────────────────────────────────────────
const ITEM_COLORS = [PRIMARY, PRIMARY_LIGHT, '#10B981', '#059669', '#047857'];

const OrderItemRow: React.FC<{
  name: string; variant: string; unitPrice: number;
  quantity: number; colorIdx: number; imageUrl?: string;
}> = ({ name, variant, unitPrice, quantity, colorIdx, imageUrl }) => {
  const bg    = ITEM_COLORS[colorIdx % ITEM_COLORS.length];
  const total = unitPrice * quantity;
  return (
    <View style={oi.row}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={oi.img} resizeMode="cover" />
      ) : (
        <View style={[oi.avatarWrap, { backgroundColor: bg + '20' }]}>
          <View style={[oi.avatar, { backgroundColor: bg }]}>
            <Text style={oi.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
      )}
      <View style={oi.info}>
        <Text style={oi.name} numberOfLines={1}>{name}</Text>
        <Text style={oi.variant}>{variant}</Text>
        <Text style={oi.unitPrice}>{formatOrderPrice(unitPrice)}</Text>
      </View>
      <View style={oi.right}>
        <View style={oi.qtyBadge}><Text style={oi.qtyText}>x {quantity}</Text></View>
        <Text style={oi.totalPrice}>{formatOrderPrice(total)}</Text>
      </View>
    </View>
  );
};
const oi = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  img:        { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6' },
  avatarWrap: { width: 64, height: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FontFamily.bold, fontSize: 20, color: '#fff' },
  info:       { flex: 1, gap: 2 },
  name:       { fontFamily: FontFamily.semiBold, fontSize: 14, color: Colors.textPrimary },
  variant:    { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary },
  unitPrice:  { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  right:      { alignItems: 'flex-end', gap: 6 },
  qtyBadge:   { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: PRIMARY_SURF, borderRadius: 5 },
  qtyText:    { fontFamily: FontFamily.semiBold, fontSize: 12, color: PRIMARY },
  totalPrice: { fontFamily: FontFamily.bold, fontSize: 13, color: Colors.textPrimary },
});

// ─── Section Card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[card.wrap, style]}>{children}</View>
);
const card = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden', marginBottom: 12 },
});

// ─── Payment Option Row ───────────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'card' | 'applepay';

const PayOptionRow: React.FC<{
  method: PaymentMethod; selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  label: string; sub: string;
  comingSoon?: boolean; isLast?: boolean;
}> = ({ method, selected, onSelect, label, sub, comingSoon, isLast }) => {
  const isActive = selected === method && !comingSoon;
  return (
    <TouchableOpacity
      style={[po.row, isActive && po.rowActive, !isLast && po.rowBorder]}
      onPress={() => !comingSoon && onSelect(method)}
      activeOpacity={comingSoon ? 1 : 0.85}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[po.label, isActive && po.labelActive]}>{label}</Text>
          {comingSoon && <ComingSoon />}
        </View>
        <Text style={po.sub}>{sub}</Text>
      </View>
      <RadioDot selected={isActive} />
    </TouchableOpacity>
  );
};
const po = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowActive:  { backgroundColor: PRIMARY_SURF },
  rowBorder:  { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  label:      { fontFamily: FontFamily.semiBold, fontSize: 14, color: Colors.textPrimary },
  labelActive:{ color: PRIMARY },
  sub:        { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<CheckoutRoute>();
  const insets     = useSafeAreaInsets();

  const cartItems = useProductStore(s => s.cartItems);
  const cartTotal = useProductStore(s => s.cartTotal);
  const clearCart = useProductStore(s => s.clearCart);

  const isLoggedIn = useAuthStore(s => !!s.token);
  const profile    = useAuthStore(s => s.user);

  const placeOrder        = useOrderStore(s => s.placeOrder);
  const isPlacing         = useOrderStore(s => s.isPlacing);
  const placeError        = useOrderStore(s => s.placeError);
  const clearErrors       = useOrderStore(s => s.clearErrors);
  const pendingAddress    = useOrderStore(s => s.pendingAddress);
  const setPendingAddress = useOrderStore(s => s.setPendingAddress);
  const applyCoupon       = useOrderStore(s => s.applyCoupon);
  const removeCoupon      = useOrderStore(s => s.removeCoupon);
  const couponCode        = useOrderStore(s => s.couponCode);
  const couponDiscount    = useOrderStore(s => s.couponDiscount);
  const couponError       = useOrderStore(s => s.couponError);
  const isApplyingCoupon  = useOrderStore(s => s.isApplyingCoupon);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [promoInput, setPromoInput]       = useState('');

  const savedAddresses  = (profile as any)?.addresses ?? [];
  const defaultAddress  = savedAddresses.find((a: any) => a.isDefault) ?? savedAddresses[0] ?? null;
  const selectedAddress = pendingAddress ?? route.params?.selectedAddressId ?? defaultAddress;

  const subtotal = cartTotal;
  const discount = couponDiscount;
  const total    = Math.max(0, subtotal - discount);

  useEffect(() => () => { clearErrors(); }, []);

  const goToSelectAddress = () => navigation.navigate('SelectAddress');

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { goToSelectAddress(); return; }
    await handleConfirmAndPlace();
  };

  const handleConfirmAndPlace = async () => {
    if (!selectedAddress) return;

    const items = cartItems.map(({ product, selectedVariant, quantity }) => ({
      product: product.id, unit: selectedVariant.unit, quantity,
    }));

    const shippingAddress: DeliveryAddress = {
      fullName:   selectedAddress.fullName   || selectedAddress.recipientName  || profile?.name  || '',
      phone:      selectedAddress.phone      || selectedAddress.recipientPhone || profile?.phone || '',
      street:     selectedAddress.street,
      city:       selectedAddress.city,
      state:      selectedAddress.state      || '',
      postalCode: selectedAddress.postalCode || selectedAddress.zip            || '',
      label:      selectedAddress.label,
    };

    if (!shippingAddress.postalCode.trim()) {
      navigation.navigate('AddAddress', { address: selectedAddress });
      return;
    }

    const order = await placeOrder({ items, shippingAddress });

    if (order) {
      setPendingAddress(null);
      const cartTotalSnapshot = cartTotal;
      await clearCart();
      navigation.replace('OrderSuccess', {
        orderId:       order.id,
        cartTotal:     cartTotalSnapshot,
        discount:      couponDiscount,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod,
      });
    }
  };

  // ── Guest wall ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Checkout</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.guestWall}>
          <View style={s.guestIconWrap}>
            <Lock size={34} color={PRIMARY} strokeWidth={1.8} />
          </View>
          <Text style={s.guestTitle}>Sign in to continue</Text>
          <Text style={s.guestSub}>
            Create an account or log in to place your order.{'\n'}Your cart is saved.
          </Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={s.ctaBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Checkout</Text>
          <Text style={s.headerSub}>Step 1 of 2</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {placeError ? (
            <View style={s.errorBanner}>
              <AlertTriangle size={13} color="#166534" strokeWidth={2} style={{ marginRight: 6 }} />
              <Text style={s.errorText}>{placeError}</Text>
            </View>
          ) : null}

          {/* ── 1. Delivery Address ── */}
          <Card>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={goToSelectAddress} style={s.editBtn}>
                <Text style={s.editBtnText}>Edit ✎</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.addrBody} onPress={goToSelectAddress} activeOpacity={0.85}>
              {selectedAddress ? (
                <>
                  <Text style={s.addrName}>
                    {selectedAddress.fullName || selectedAddress.recipientName || profile?.name || 'Your Name'}
                  </Text>
                  <Text style={s.addrLine} numberOfLines={2}>
                    {[selectedAddress.street, selectedAddress.city, selectedAddress.state,
                      selectedAddress.postalCode].filter(Boolean).join(', ')}
                  </Text>
                  {(selectedAddress.phone || selectedAddress.recipientPhone || profile?.phone) && (
                    <Text style={s.addrLine}>
                      {selectedAddress.phone || selectedAddress.recipientPhone || profile?.phone}
                    </Text>
                  )}
                </>
              ) : (
                <View style={{ gap: 4 }}>
                  <Text style={[s.addrName, { color: PRIMARY }]}>+ Select delivery address</Text>
                  <Text style={s.addrLine}>Tap to choose or add an address</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>

          {/* ── 2. Order Items ── */}
          <Card>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Order Items ({cartItems.length})</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}>
                <Text style={s.editBtnText}>Edit Cart</Text>
              </TouchableOpacity>
            </View>
            {cartItems.map(({ product, selectedVariant, quantity }, idx) => (
              <OrderItemRow
                key={`${product.id}::${selectedVariant.unit}`}
                name={product.name}
                variant={selectedVariant.unit}
                unitPrice={selectedVariant.price}
                quantity={quantity}
                colorIdx={idx}
                imageUrl={(product as any).imageUrl ?? (product as any).image}
              />
            ))}
          </Card>

          {/* ── 3. Promo Code ── */}
          <Card>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Promo Code</Text>
              {couponCode ? (
                <TouchableOpacity onPress={() => { removeCoupon(); setPromoInput(''); }}>
                  <Text style={s.editBtnText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {couponCode ? (
              <View style={s.couponApplied}>
                <Check size={16} color={PRIMARY} strokeWidth={2.5} />
                <View style={{ flex: 1 }}>
                  <Text style={s.couponAppliedCode}>{couponCode}</Text>
                  <Text style={s.couponAppliedSub}>You save {formatOrderPrice(couponDiscount)}!</Text>
                </View>
              </View>
            ) : (
              <View style={s.couponInputRow}>
                <TextInput
                  style={s.couponInput}
                  placeholder="Enter promo code"
                  placeholderTextColor={Colors.textSecondary}
                  value={promoInput}
                  onChangeText={t => setPromoInput(t.toUpperCase())}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={() => { if (promoInput.trim()) applyCoupon(promoInput.trim(), subtotal); }}
                />
                <TouchableOpacity
                  style={[s.couponApplyBtn, (!promoInput.trim() || isApplyingCoupon) && s.couponApplyBtnDisabled]}
                  onPress={() => { if (promoInput.trim()) applyCoupon(promoInput.trim(), subtotal); }}
                  disabled={!promoInput.trim() || isApplyingCoupon}
                >
                  {isApplyingCoupon
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.couponApplyBtnText}>Apply</Text>
                  }
                </TouchableOpacity>
              </View>
            )}

            {couponError ? (
              <View style={s.couponErrorRow}>
                <AlertTriangle size={12} color="#B91C1C" strokeWidth={2} />
                <Text style={s.couponErrorText}>{couponError}</Text>
              </View>
            ) : null}
          </Card>

          {/* ── 4. Payment Method ── */}
          <Card>
            <View style={[s.cardHeader, { borderBottomWidth: 0.5, borderBottomColor: Colors.border }]}>
              <Text style={s.cardTitle}>Payment Method</Text>
            </View>
            <PayOptionRow
              method="cod" selected={paymentMethod} onSelect={setPaymentMethod}
              label="Cash on Delivery" sub="Pay when you receive your order"
            />
            <PayOptionRow
              method="card" selected={paymentMethod} onSelect={setPaymentMethod}
              label="Credit / Debit Card" sub="Visa, Mastercard, AMEX"
              comingSoon
            />
            <PayOptionRow
              method="applepay" selected={paymentMethod} onSelect={setPaymentMethod}
              label="Apple Pay" sub="Quick, secure payment"
              comingSoon isLast
            />
            <View style={s.securityBadge}>
              <Text style={s.securityText}>🔒  Your payment information is secure and encrypted</Text>
            </View>
          </Card>

          {/* ── 5. Order Summary ── */}
          <Card style={{ padding: 16 }}>
            <Text style={[s.cardTitle, { marginBottom: 12 }]}>Order Summary</Text>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Subtotal ({cartItems.length} items)</Text>
              <Text style={s.priceValue}>{formatOrderPrice(subtotal)}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Delivery Fee</Text>
              <Text style={s.freeText}>FREE</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>Promo ({couponCode})</Text>
                <Text style={s.discountValue}>−{formatOrderPrice(couponDiscount)}</Text>
              </View>
            )}
            <View style={s.priceDivider} />
            <View style={s.priceRow}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalValue}>{formatOrderPrice(total)}</Text>
            </View>
          </Card>

        </ScrollView>

        {/* ── Sticky Footer ── */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={s.footerInner}>
            <View style={s.secureWrap}>
              <View>
                <Text style={s.secureTitle}>Secure Checkout</Text>
                <Text style={s.secureSub}>100% secure payment</Text>
              </View>
            </View>
            <RingButton
              label={`Place Order  •  ${formatOrderPrice(total)}`}
              variant="solid"
              color={PRIMARY}
              onComplete={handlePlaceOrder}
              style={s.placeBtn}
              textStyle={s.placeBtnText}
            />
          </View>
          <Text style={s.termsNote}>
            By placing this order you agree to our{' '}
            <Text style={{ color: PRIMARY_LIGHT }}>Terms &amp; Conditions</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  scroll:        { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 16 },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  backBtn:      { width: 36, height: 36, borderRadius: 18, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center', gap: 1 },
  headerTitle:  { fontFamily: FontFamily.bold, fontSize: 16, color: Colors.textPrimary },
  headerSub:    { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.textSecondary },

  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_SURF, padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: Colors.borderFocus, marginBottom: 12 },
  errorText:   { fontFamily: FontFamily.regular, fontSize: 12, color: PRIMARY_DARK, flex: 1 },

  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  cardTitle:      { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary },
  editBtn:        { padding: 4 },
  editBtnText:    { fontFamily: FontFamily.semiBold, fontSize: 13, color: PRIMARY },

  addrBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  addrName: { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 3 },
  addrLine: { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  couponInputRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  couponInput:            { flex: 1, height: 44, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, fontFamily: FontFamily.semiBold, fontSize: 14, color: Colors.textPrimary, backgroundColor: '#FAFAFA', letterSpacing: 1 },
  couponApplyBtn:         { height: 44, paddingHorizontal: 18, backgroundColor: '#2E7D32', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  couponApplyBtnDisabled: { opacity: 0.5 },
  couponApplyBtnText:     { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
  couponApplied:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 14, padding: 12, backgroundColor: PRIMARY_SURF, borderRadius: 8, borderWidth: 0.5, borderColor: PRIMARY + '40' },
  couponAppliedCode:      { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  couponAppliedSub:       { fontFamily: FontFamily.regular, fontSize: 12, color: PRIMARY_DARK, marginTop: 1 },
  couponErrorRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 14, marginBottom: 12, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 0.5, borderColor: '#FECACA' },
  couponErrorText:        { fontFamily: FontFamily.regular, fontSize: 12, color: '#B91C1C', flex: 1 },

  securityBadge: { margin: 12, marginTop: 0, padding: 10, borderRadius: 8, backgroundColor: PRIMARY_SURF, borderWidth: 0.5, borderColor: Colors.borderFocus + '60' },
  securityText:  { fontFamily: FontFamily.regular, fontSize: 11, color: PRIMARY_DARK },

  priceRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  priceLabel:    { fontFamily: FontFamily.regular, fontSize: 13, color: Colors.textSecondary },
  priceValue:    { fontFamily: FontFamily.semiBold, fontSize: 13, color: Colors.textPrimary },
  freeText:      { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  discountValue: { fontFamily: FontFamily.bold, fontSize: 13, color: '#16A34A' },
  priceDivider:  { height: 0.5, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel:    { fontFamily: FontFamily.bold, fontSize: 15, color: Colors.textPrimary },
  totalValue:    { fontFamily: FontFamily.extraBold, fontSize: 22, color: PRIMARY },

  footer:      { backgroundColor: NAVY, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.border },
  footerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  secureWrap:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  secureTitle: { fontFamily: FontFamily.semiBold, fontSize: 13, color: '#ECFDF5' },
  secureSub:   { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.textSecondary },
  placeBtn:    { backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  placeBtnText:{ fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
  termsNote:   { fontFamily: FontFamily.regular, textAlign: 'center', fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },

  guestWall:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  guestIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: PRIMARY_SURF, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  guestTitle:    { fontFamily: FontFamily.bold, fontSize: 20, color: Colors.textPrimary, textAlign: 'center' },
  guestSub:      { fontFamily: FontFamily.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  ctaBtn:        { width: '100%', backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  ctaBtnText:    { fontFamily: FontFamily.semiBold, fontSize: 15, color: '#fff' },
  outlineBtn:    { width: '100%', borderRadius: 8, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: PRIMARY },
  outlineBtnText:{ fontFamily: FontFamily.semiBold, fontSize: 15, color: PRIMARY },
});