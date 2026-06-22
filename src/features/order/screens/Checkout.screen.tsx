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
import {
  ArrowLeft, Check, AlertTriangle, Lock, ShoppingBag,
  MapPin, Clock, Truck, Banknote, CreditCard, Smartphone,
} from 'lucide-react-native';

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

const PRIMARY       = '#2E7D32';
const PRIMARY_LIGHT = '#4CAF50';
const PRIMARY_SURF  = '#F0FDF4';
const PRIMARY_DARK  = '#1A1F2E';
const NAVY          = '#1A1F2E';
const GREEN         = '#2E7D32';
const SURFACE       = '#FFFFFF';
const BORDER        = '#E8E8E8';
const TEXT1         = '#1A1F2E';
const TEXT2         = '#7A7A7A';

// ─── Radio dot ────────────────────────────────────────────────────────────────
const RadioDot: React.FC<{ selected: boolean }> = ({ selected }) => (
  <View style={[rd.outer, selected && rd.outerSel]}>
    {selected ? <View style={rd.inner} /> : null}
  </View>
);
const rd = StyleSheet.create({
  outer:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
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
const OrderItemRow: React.FC<{
  name: string; variant: string; unitPrice: number;
  quantity: number; imageUrl?: string;
}> = ({ name, variant, unitPrice, quantity, imageUrl }) => {
  const total = unitPrice * quantity;
  return (
    <View style={oi.row}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={oi.img} resizeMode="cover" />
      ) : (
        <View style={oi.imgPlaceholder}>
          <Text style={oi.avatarText}>{name.charAt(0).toUpperCase()}</Text>
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
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  img:           { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6' },
  imgPlaceholder:{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontFamily: FontFamily.bold, fontSize: 20, color: TEXT2 },
  info:          { flex: 1, gap: 2 },
  name:          { fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1 },
  variant:       { fontFamily: FontFamily.regular, fontSize: 12, color: TEXT2 },
  unitPrice:     { fontFamily: FontFamily.regular, fontSize: 13, color: TEXT2, marginTop: 2 },
  right:         { alignItems: 'flex-end', gap: 8 },
  qtyBadge:      { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: PRIMARY_SURF, borderRadius: 6 },
  qtyText:       { fontFamily: FontFamily.semiBold, fontSize: 12, color: PRIMARY },
  totalPrice:    { fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1 },
});

// ─── Section Card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[card.wrap, style]}>{children}</View>
);
const card = StyleSheet.create({
  wrap: { backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', marginBottom: 10 },
});

// ─── Payment Option Row ───────────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'card' | 'applepay';

const PAY_ICONS: Record<PaymentMethod, React.ComponentType<any>> = {
  cod:      Banknote,
  card:     CreditCard,
  applepay: Smartphone,
};

const PayOptionRow: React.FC<{
  method: PaymentMethod; selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  label: string; sub: string;
  comingSoon?: boolean; isLast?: boolean;
}> = ({ method, selected, onSelect, label, sub, comingSoon, isLast }) => {
  const isActive = selected === method && !comingSoon;
  const Icon = PAY_ICONS[method];
  return (
    <TouchableOpacity
      style={[po.row, isActive && po.rowActive, !isLast && po.rowBorder]}
      onPress={() => !comingSoon && onSelect(method)}
      activeOpacity={comingSoon ? 1 : 0.85}
    >
      <View style={[po.iconWrap, isActive && po.iconWrapActive]}>
        <Icon size={20} color={isActive ? PRIMARY : TEXT2} strokeWidth={2} />
      </View>
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
  rowBorder:  { borderBottomWidth: 0.5, borderBottomColor: BORDER },
  iconWrap:   { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: '#fff' },
  label:      { fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1 },
  labelActive:{ color: PRIMARY },
  sub:        { fontFamily: FontFamily.regular, fontSize: 12, color: TEXT2, marginTop: 1 },
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
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loadingCharge, setLoadingCharge]   = useState(false);

  const savedAddresses  = (profile as any)?.addresses ?? [];
  const defaultAddress  = savedAddresses.find((a: any) => a.isDefault) ?? savedAddresses[0] ?? null;
  const selectedAddress = pendingAddress ?? route.params?.selectedAddressId ?? defaultAddress;

  const subtotal = cartTotal;
  const discount = couponDiscount;
  const total    = Math.max(0, subtotal - discount + deliveryCharge);

  useEffect(() => () => { clearErrors(); }, []);

  // Fetch delivery charge whenever selected address changes
  useEffect(() => {
    const addr = pendingAddress ?? defaultAddress;
    if (!addr?.city && !addr?.state) { setDeliveryCharge(0); return; }
    setLoadingCharge(true);
    import('../../../app/lib/api').then(({ API }) =>
      API.post('/delivery-zones/resolve', { city: addr.city || null, atoll: addr.state || null })
        .then(res => setDeliveryCharge(res.data?.data?.charge ?? 0))
        .catch(() => setDeliveryCharge(0))
        .finally(() => setLoadingCharge(false))
    );
  }, [pendingAddress, defaultAddress?.city, defaultAddress?.state]);

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
      zip: selectedAddress.zip || '',
      label:      selectedAddress.label,
    };

    if (!shippingAddress.zip?.trim()) {
      navigation.navigate('AddAddress', { address: selectedAddress });
      return;
    }

    const order = await placeOrder({ items, shippingAddress, couponCode: couponCode ?? undefined });

    if (order) {
      setPendingAddress(null);
      removeCoupon();
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
        <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ArrowLeft size={20} color={TEXT1} strokeWidth={2} />
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
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft size={20} color={TEXT1} strokeWidth={2} />
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
          {placeError && !placeError.toLowerCase().includes('minimum') ? (
            <View style={s.errorBanner}>
              <AlertTriangle size={13} color="#B91C1C" strokeWidth={2} style={{ marginRight: 6 }} />
              <Text style={s.errorText}>{placeError}</Text>
            </View>
          ) : null}

          {/* ── Estimated Delivery banner ── */}
          <View style={s.deliveryCard}>
            <View style={s.deliveryLeft}>
              <View style={s.deliveryIconWrap}>
                <Truck size={20} color="#fff" strokeWidth={2} />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={s.deliveryTitle}>{deliveryCharge > 0 ? `MVR ${deliveryCharge} Delivery` : 'Free Delivery'}</Text>
                <Text style={s.deliverySub}>{deliveryCharge > 0 ? 'Delivery charge applies to your area' : 'We deliver your order for free'}</Text>
              </View>
            </View>
            <View style={s.deliveryDivider} />
            <View style={s.deliveryRight}>
              <View style={s.deliveryClockWrap}>
                <Clock size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
              </View>
              <View>
                <Text style={s.deliveryMetaLabel}>Estimated Delivery</Text>
                <Text style={s.deliveryTime}>20–30 min</Text>
                <Text style={s.deliveryMetaLabel}>Standard Delivery</Text>
              </View>
            </View>
          </View>

          {/* ── 1. Delivery Address ── */}
          <Card>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={goToSelectAddress} style={s.editBtn}>
                <Text style={s.editBtnText}>Edit ✎</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.addrBody} onPress={goToSelectAddress} activeOpacity={0.85}>
              <View style={s.addrPinWrap}>
                <MapPin size={20} color={PRIMARY} strokeWidth={2} />
              </View>
              {selectedAddress ? (
                <View style={{ flex: 1 }}>
                  <Text style={s.addrName}>
                    {selectedAddress.fullName || selectedAddress.recipientName || profile?.name || 'Your Name'}
                  </Text>
                  <Text style={s.addrLine} numberOfLines={2}>
                    {[selectedAddress.street, selectedAddress.city, selectedAddress.state,
                      selectedAddress.zip].filter(Boolean).join(', ')}
                  </Text>
                  {(selectedAddress.phone || selectedAddress.recipientPhone || profile?.phone) && (
                    <Text style={s.addrLine}>
                      {selectedAddress.phone || selectedAddress.recipientPhone || profile?.phone}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ flex: 1, gap: 4 }}>
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
              <View key={`${product.id}::${selectedVariant.unit}`}>
                <OrderItemRow
                  name={product.name}
                  variant={selectedVariant.unit}
                  unitPrice={selectedVariant.price}
                  quantity={quantity}
                  imageUrl={(product as any).imageUrl ?? (product as any).image}
                />
                {idx < cartItems.length - 1 && <View style={s.itemDivider} />}
              </View>
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
                  placeholderTextColor={TEXT2}
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

            {/* Minimum order warning — shown when coupon is applied but order total is too low */}
            {couponCode && placeError && placeError.toLowerCase().includes('minimum') ? (
              <View style={s.couponMinWarnRow}>
                <AlertTriangle size={12} color="#92400E" strokeWidth={2} />
                <Text style={s.couponMinWarnText}>{placeError}</Text>
              </View>
            ) : null}
          </Card>

          {/* ── 4. Payment Method ── */}
          <Card>
            <View style={[s.cardHeader, { borderBottomWidth: 0.5, borderBottomColor: BORDER }]}>
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
          </Card>

          {/* ── 5. Order Summary / Billing Details ── */}
          <Card style={{ padding: 16, marginBottom: 0 }}>
            <Text style={[s.cardTitle, { marginBottom: 12 }]}>Billing Details</Text>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Item Total</Text>
              <Text style={s.priceValue}>{formatOrderPrice(subtotal)}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Delivery Charge</Text>
              {loadingCharge
                ? <ActivityIndicator size="small" color={PRIMARY} />
                : <Text style={deliveryCharge > 0 ? s.priceValue : s.freeText}>
                    {deliveryCharge > 0 ? formatOrderPrice(deliveryCharge) : 'FREE'}
                  </Text>
              }
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Discount</Text>
              <Text style={s.discountValue}>−{formatOrderPrice(couponDiscount || 0)}</Text>
            </View>
            <View style={s.priceDivider} />
            <View style={s.priceRow}>
              <Text style={s.totalLabel}>To Pay</Text>
              <Text style={s.totalValue}>{formatOrderPrice(total)}</Text>
            </View>
          </Card>

        </ScrollView>

        {/* ── Sticky Footer — unchanged ── */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={s.footerMain}>
            <View style={s.footerLeft}>
              <Text style={s.footerTotalLabel}>Total Payable</Text>
              <Text style={s.footerTotalValue}>{formatOrderPrice(total)}</Text>
              
            </View>
            <TouchableOpacity
              style={[s.checkoutBtn, isPlacing && { opacity: 0.7 }]}
              onPress={handlePlaceOrder}
              activeOpacity={0.88}
              disabled={isPlacing}
            >
              {isPlacing
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <ShoppingBag size={18} color="#fff" strokeWidth={2} />
                    <Text style={s.checkoutBtnText}>Place Order</Text>
                  </>
              }
            </TouchableOpacity>
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
  safe:          { flex: 1, backgroundColor: '#F2F4F7' },
  scroll:        { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 16 },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:      { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center', gap: 1 },
  headerTitle:  { fontFamily: FontFamily.bold, fontSize: 16, color: TEXT1 },
  headerSub:    { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2 },

  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: '#FECACA', marginBottom: 10 },
  errorText:   { fontFamily: FontFamily.regular, fontSize: 12, color: '#B91C1C', flex: 1 },

  // ── Estimated Delivery banner (Cart-style) ──────────────────────────────────
  deliveryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_DARK, borderRadius: 12, padding: 18, marginBottom: 10 },
  deliveryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1.4, minWidth: 0 },
  deliveryIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  deliveryTitle: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFFFFF' },
  deliverySub:   { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  deliveryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 16 },
  deliveryRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  deliveryClockWrap: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  deliveryMetaLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.5)', flexShrink: 1 },
  deliveryTime: { fontFamily: FontFamily.bold, fontSize: 14, color: PRIMARY, marginVertical: 1 },

  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  cardTitle:      { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1 },
  editBtn:        { padding: 4 },
  editBtnText:    { fontFamily: FontFamily.semiBold, fontSize: 13, color: PRIMARY },

  addrBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  addrPinWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: PRIMARY_SURF, alignItems: 'center', justifyContent: 'center' },
  addrName: { fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1, marginBottom: 3 },
  addrLine: { fontFamily: FontFamily.regular, fontSize: 13, color: TEXT2, lineHeight: 20 },

  itemDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16 },

  couponInputRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  couponInput:            { flex: 1, height: 44, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 12, fontFamily: FontFamily.semiBold, fontSize: 14, color: TEXT1, backgroundColor: '#FAFAFA', letterSpacing: 1 },
  couponApplyBtn:         { height: 44, paddingHorizontal: 18, backgroundColor: PRIMARY, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  couponApplyBtnDisabled: { opacity: 0.5 },
  couponApplyBtnText:     { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
  couponApplied:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 14, padding: 12, backgroundColor: PRIMARY_SURF, borderRadius: 8, borderWidth: 0.5, borderColor: PRIMARY + '40' },
  couponAppliedCode:      { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  couponAppliedSub:       { fontFamily: FontFamily.regular, fontSize: 12, color: PRIMARY_DARK, marginTop: 1 },
  couponErrorRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 14, marginBottom: 12, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 0.5, borderColor: '#FECACA' },
  couponErrorText:        { fontFamily: FontFamily.regular, fontSize: 12, color: '#B91C1C', flex: 1 },
  couponMinWarnRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 14, marginBottom: 12, padding: 10, backgroundColor: '#FFFBEB', borderRadius: 8, borderWidth: 0.5, borderColor: '#FCD34D' },
  couponMinWarnText:      { fontFamily: FontFamily.regular, fontSize: 12, color: '#92400E', flex: 1 },

  priceRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  priceLabel:    { fontFamily: FontFamily.regular, fontSize: 13, color: TEXT2 },
  priceValue:    { fontFamily: FontFamily.semiBold, fontSize: 13, color: TEXT1 },
  freeText:      { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  discountValue: { fontFamily: FontFamily.bold, fontSize: 13, color: PRIMARY },
  priceDivider:  { height: 1, backgroundColor: BORDER, marginVertical: 10 },
  totalLabel:    { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1 },
  totalValue:    { fontFamily: FontFamily.bold, fontSize: 18, color: TEXT1 },

  // ── Footer (unchanged) ──────────────────────────────────────────────────────
  footer:           { backgroundColor: NAVY, paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: BORDER },
  footerMain:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  footerLeft:       { flexShrink: 1 },
  footerTotalLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  footerTotalValue: { fontFamily: FontFamily.bold, fontSize: 22, color: '#FFFFFF', marginTop: 2 },
  secureSub:        { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  checkoutBtnText: { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },
  termsNote:   { fontFamily: FontFamily.regular, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },

  guestWall:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  guestIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: PRIMARY_SURF, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  guestTitle:    { fontFamily: FontFamily.bold, fontSize: 20, color: TEXT1, textAlign: 'center' },
  guestSub:      { fontFamily: FontFamily.regular, fontSize: 14, color: TEXT2, textAlign: 'center', lineHeight: 22 },
  ctaBtn:        { width: '100%', backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  ctaBtnText:    { fontFamily: FontFamily.semiBold, fontSize: 15, color: '#fff' },
  outlineBtn:    { width: '100%', borderRadius: 8, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: PRIMARY },
  outlineBtnText:{ fontFamily: FontFamily.semiBold, fontSize: 15, color: PRIMARY },
});