// ── Design tokens ─────────────────────────────────────────────────────────────
// product/screens/Cart.screen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Alert } from 'react-native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Animated, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, type NavigationProp } from '@react-navigation/native';
import {
  ArrowLeft, Trash2, ShieldCheck,
  ShoppingBag, ShoppingCart,
  Plus, AlertCircle, Clock, BadgeCheck,
  Store, Leaf, Banknote, Sun, Truck,
} from 'lucide-react-native';
import { FontFamily } from '../../../theme';
import { useProductStore }         from '../store/product.store';
import { useAuthStore }            from '../../auth/store/auth.store';
import { productService }          from '../services/product.service';
import { formatPrice, getVariantDiscountedPrice } from '../utils/product.utils';
import type { CartItem, Product }  from '../types/product.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import { RingButton }              from '../../../shared/components/Ringbutton.component';
import { useRingNavigate }         from '../../../shared/hooks/usernavigate';
import type { Address }            from '../../../types/user.types';
import cartd from '@/assets/images/cartd.png';

// Stable empty-array reference to avoid "Maximum update depth exceeded"
const EMPTY_ADDRESSES: Address[] = [];

const PRIMARY      = '#2E7D32';
const PRIMARY_SURF = '#F0FDF4';
const PRIMARY_DARK = '#1A1F2E';
const SURFACE      = '#FFFFFF';
const PAGE_BG      = '#F2F4F7';
const BORDER       = '#E8E8E8';
const TEXT1        = '#1A1F2E';
const TEXT2        = '#7A7A7A';
const RING_SIZE    = 28;

const CARD_COLORS = ['#FFF7E6','#F0FDF4','#EFF6FF','#FFF1F2','#FFFBEB','#F0FDF4','#FFF7E6','#EFF6FF'];

// ── Trash Ring Button ─────────────────────────────────────────────────────────
const TrashRingButton: React.FC<{
  onConfirm: () => void;
  variant?: 'card' | 'stepper';
}> = ({ onConfirm, variant = 'card' }) => {
  const { active, progress, start } = useRingNavigate(onConfirm);
  const btnStyle = variant === 'stepper' ? s.stepperTrashSlot : s.trashBtn;

  return (
    <TouchableOpacity
      onPress={start}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={btnStyle}
    >
      {active && (
        <View style={s.ringWrap} pointerEvents="none">
          <AnimatedRing progress={progress} />
        </View>
      )}
      <Trash2
        size={variant === 'stepper' ? 13 : 14}
        color={active ? PRIMARY : '#EF4444'}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
};

const AnimatedRing: React.FC<{ progress: Animated.Value }> = ({ progress }) => {
  const rotation = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <View style={s.ringContainer}>
      <View style={s.ringBg} />
      <Animated.View style={[s.ringArcWrapper, { transform: [{ rotate: rotation }] }]}>
        <View style={s.ringArc} />
      </Animated.View>
    </View>
  );
};

// ── CartScreen ────────────────────────────────────────────────────────────────
export const CartScreen: React.FC = () => {
  const insets         = useSafeAreaInsets();
  const navigation     = useNavigation<NavigationProp<RootStackParamList>>();
  const cartItems      = useProductStore(s => s.cartItems);
  const cartLoading    = useProductStore(s => s.cartLoading);
  const cartCount      = useProductStore(s => s.cartCount);
  const uniqueProductCount = new Set(cartItems.map(i => i.product.id)).size;
  const cartError      = useProductStore(s => s.cartError);
  const updateQty      = useProductStore(s => s.updateQuantity);
  const removeFromCart = useProductStore(s => s.removeFromCart);
  const addToCart      = useProductStore(s => s.addToCart);
  const isLoggedIn     = useAuthStore(s => !!s.token);
  const userAddresses  = useAuthStore(s => s.user?.addresses ?? EMPTY_ADDRESSES);

  // ── Android hardware back → go home if no history ────────────────────────
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs', { screen: 'Home' } as any);
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [navigation])
  );

  const defaultAddress = userAddresses.find(a => a.isDefault) ?? userAddresses[0] ?? null;

  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // Delivery is always free — no API call needed
  const deliveryCharge = 0;

  useEffect(() => {
    let cancelled = false;
    productService.listProducts({ popular: true, limit: 12 })
      .then(res => {
        if (cancelled) return;
        const cartIds = new Set(cartItems.map(i => i.product.id));
        setSuggestedProducts(res.data.filter(p => !cartIds.has(p.id)).slice(0, 8));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cartItems.length]);

  const handleCheckoutComplete = useCallback(() => {
    if (!isLoggedIn) { navigation.navigate('Login'); return; }
    navigation.navigate('Checkout');
  }, [isLoggedIn, navigation]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const itemsTotal = cartItems.reduce(
    (sum: number, item) => sum + item.selectedVariant.price * item.quantity, 0);
  const discountTotal = cartItems.reduce((sum: number, item) => {
    const d = getVariantDiscountedPrice(item.selectedVariant, item.product.discountPercentage);
    return sum + (item.selectedVariant.price - d) * item.quantity;
  }, 0);
  const subtotal    = itemsTotal - discountTotal;
  const totalAmount = subtotal + deliveryCharge;

  // ── Header ────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[s.headerBg, { paddingTop: insets.top + 8 }]}>
      <View style={s.headerRow}>
        <TouchableOpacity
          style={s.headerBackBtn}
          onPress={() => setTimeout(() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs', { screen: 'Home' } as any), 50)}
          activeOpacity={0.75}
        >
          <ArrowLeft size={18} color={TEXT1} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Cart</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={s.headerCartBtn}
            activeOpacity={0.75}
            onPress={() => setTimeout(() => navigation.navigate('MainTabs', { screen: 'Home' } as any), 50)}
          >
            <ShoppingCart size={18} color="#fff" strokeWidth={2} />
            {cartItems.length > 0 && (
              <View style={s.headerCartBadge}>
                <Text style={s.headerCartBadgeText}>{uniqueProductCount > 99 ? '99+' : uniqueProductCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ── Cart Item Card ────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: CartItem }) => {
    const { product, selectedVariant, quantity } = item;
    const discountedPrice = getVariantDiscountedPrice(selectedVariant, product.discountPercentage);
    const lineTotal  = discountedPrice * quantity;
    const perKgPrice = selectedVariant.weight ? discountedPrice / selectedVariant.weight : null;
    const itemKey    = `${product.id}::${selectedVariant.unit}`;
    const atMaxStock = quantity >= selectedVariant.quantity;

    const increase = () => {
      if (atMaxStock) {
        Alert.alert('Stock limit reached', `Only ${selectedVariant.quantity} ${selectedVariant.unit} in stock.`);
        return;
      }
      updateQty(product.id, selectedVariant.unit, quantity + 1);
    };

    const decrease = () => {
      if (quantity <= 1) return;
      updateQty(product.id, selectedVariant.unit, quantity - 1);
    };

    return (
      <View style={s.card}>
        <View style={s.cardInner}>
          <View style={s.cardImgWrap}>
            <Image source={{ uri: product.image }} style={s.cardImg} resizeMode="contain" />
            {product.discountPercentage > 0 && (
              <View style={s.discountBadge}>
                <Text style={s.discountText}>-{product.discountPercentage}%</Text>
              </View>
            )}
          </View>
          <View style={s.cardBody}>
            <View style={s.cardNameRow}>
              <Text style={s.cardName} numberOfLines={2}>{product.name}</Text>
              <TrashRingButton onConfirm={() => removeFromCart(product.id, selectedVariant.unit)} />
            </View>
            <View style={s.stockRow}>
              <ShieldCheck size={11} color={PRIMARY} strokeWidth={2.5} />
              <Text style={s.stockText}>In Stock</Text>
            </View>

            <View style={{ marginTop: 8 }}>
              <View style={s.priceBlock}>
                <Text style={s.cardPrice}>{formatPrice(discountedPrice)}</Text>
                {perKgPrice != null && (
                  <Text style={s.cardPerKg}>{formatPrice(perKgPrice)}/kg</Text>
                )}
              </View>

              <View style={s.cardBottomRow}>
                <View style={s.stepper}>
                  <TouchableOpacity
                    style={[s.stepMinus, quantity === 1 && s.stepMinusDisabled]}
                    onPress={quantity > 1 ? decrease : undefined}
                    activeOpacity={quantity > 1 ? 0.7 : 1}
                    disabled={quantity === 1}
                  >
                    <Text style={[s.stepMinusText, quantity === 1 && s.stepMinusTextDisabled]}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepCount}>{quantity}</Text>
                  <TouchableOpacity
                    style={[s.stepPlus, atMaxStock && s.stepPlusDisabled]}
                    onPress={increase}
                    activeOpacity={atMaxStock ? 1 : 0.7}
                    disabled={atMaxStock}
                  >
                    <Text style={[s.stepPlusText, atMaxStock && s.stepPlusTextDisabled]}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.lineTotalBlock}>
                  <Text style={s.lineTotal}>{formatPrice(lineTotal)}</Text>
                  {quantity > 1 && <Text style={s.lineEach}>{formatPrice(discountedPrice)} each</Text>}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ── Footer ────────────────────────────────────────────────────────────────
  const renderFooter = () => (
    <View style={[s.footer, { paddingBottom: 10 }]}>
      <View style={s.footerMain}>
        <View style={s.footerLeft}>
          <Text style={s.footerTotalLabel}>Total Payable</Text>
          <Text style={s.footerTotalValue}>{formatPrice(totalAmount)}</Text>
          {discountTotal > 0 && (
            <Text style={s.footerSavings}>You save {formatPrice(discountTotal)} 🎉</Text>
          )}
        </View>
        <TouchableOpacity
          style={s.checkoutBtn}
          onPress={handleCheckoutComplete}
          activeOpacity={0.88}
        >
          <ShoppingBag size={18} color="#fff" strokeWidth={2} />
          <Text style={s.checkoutBtnText} numberOfLines={1}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.footerTrustRow, { paddingBottom: 0 }]}>
        <View style={s.footerTrustItem}>
          <BadgeCheck size={14} color={PRIMARY} strokeWidth={2} />
          <Text style={s.footerTrustText}>Premium Quality</Text>
        </View>
        <View style={s.footerTrustSep} />
        <View style={s.footerTrustItem}>
          <Truck size={14} color={PRIMARY} strokeWidth={2} />
          <Text style={s.footerTrustText}>Free Delivery</Text>
        </View>
        <View style={s.footerTrustSep} />
        <View style={s.footerTrustItem}>
          <Leaf size={14} color={PRIMARY} strokeWidth={2} />
          <Text style={s.footerTrustText}>Halal</Text>
        </View>
      </View>
    </View>
  );

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!cartLoading && cartItems.length === 0) {
    return (
      <View style={s.safe}>
        {renderHeader()}
        <View style={s.empty}>
          <Image source={cartd} style={s.emptyImage} resizeMode="contain" />
          <View style={s.emptyContent}>
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <RingButton
              label="Continue Shopping"
              variant="solid"
              color={PRIMARY}
              onComplete={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              icon={<ShoppingBag size={16} color="#fff" strokeWidth={2} />}
              style={s.shopRingBtn}
            />
          </View>
        </View>
      </View>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.safe}>
      {renderHeader()}

      {cartError ? (
        <View style={s.cartErrorBanner}>
          <AlertCircle size={14} color="#B91C1C" strokeWidth={2} />
          <Text style={s.cartErrorText}>{cartError}</Text>
        </View>
      ) : null}

      {cartLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <>
          <FlatList
            data={[1]}
            keyExtractor={() => 'wrapper'}
            ListFooterComponent={renderFooter}
            renderItem={() => (
              <View style={s.sectionGap}>

                {/* ── Delivery banner ── */}
                <View style={s.freeDeliveryCard}>
                  <View style={s.freeDeliveryLeft}>
                    <View style={s.freeDeliveryIconWrap}>
                      <Truck size={20} color="#fff" strokeWidth={2} />
                    </View>
                    <View style={{ flexShrink: 1 }}>
                      <Text style={s.freeDeliveryTitle}>Free Delivery</Text>
                      <Text style={s.freeDeliverySub}>
                        {isLoggedIn && defaultAddress
                          ? 'We deliver your order for free'
                          : 'Login to enjoy free delivery'}
                      </Text>
                    </View>
                  </View>
                  <View style={s.freeDeliveryDivider} />
                  <View style={s.freeDeliveryRight}>
                    <View style={s.freeDeliveryClockWrap}>
                      <Clock size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={s.freeDeliveryMetaLabel}>Delivery Time</Text>
                      <Text style={s.freeDeliveryTime}>20–30 min</Text>
                      <Text style={s.freeDeliveryMetaLabel}>Standard Delivery</Text>
                    </View>
                  </View>
                </View>

                {/* ── Items ── */}
                <View style={s.itemsCard}>
                  <View style={s.itemsCardHeader}>
                    <Text style={s.itemsCardLeft}>Items</Text>
                    <Text style={s.itemsCardRight}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={s.itemsDivider} />
                  {cartItems.map((item, idx) => (
                    <View key={`${item.product.id}::${item.selectedVariant.unit}`}>
                      {renderItem({ item })}
                      {idx < cartItems.length - 1 && <View style={s.itemsDivider} />}
                    </View>
                  ))}
                </View>

                {/* ── Billing Details ── */}
                <View style={s.billingCard}>
                  <Text style={s.billingTitle}>Billing Details</Text>
                  <View style={s.divider} />
                  <View style={s.billingRow}>
                    <Text style={s.billingLabel}>Item Total</Text>
                    <Text style={s.billingValue}>{formatPrice(itemsTotal)}</Text>
                  </View>
                  {discountTotal > 0 && (
                    <View style={s.billingRow}>
                      <Text style={s.billingLabel}>Discount</Text>
                      <Text style={[s.billingValue, { color: PRIMARY }]}>− {formatPrice(discountTotal)}</Text>
                    </View>
                  )}
                  <View style={s.billingRow}>
                    <Text style={s.billingLabel}>Delivery Charge</Text>
                    <Text style={[s.billingValue, { color: PRIMARY }]}>FREE</Text>
                  </View>
                  <View style={s.billingRow}>
                    <Text style={s.billingLabel}>Platform Fee</Text>
                    <Text style={[s.billingValue, { color: PRIMARY }]}>FREE</Text>
                  </View>
                  <View style={s.divider} />
                  <View style={s.billingRow}>
                    <Text style={s.billingTotalLabel}>To Pay</Text>
                    <Text style={s.billingTotalValue}>{formatPrice(subtotal)}</Text>
                  </View>
                </View>

                {/* ── Shop Info card ── */}
                <View style={s.shopInfoCard}>
                  <View style={s.shopInfoRow}>
                    <View style={s.shopInfoIconWrap}>
                      <Store size={22} color={PRIMARY} strokeWidth={2} />
                    </View>
                    <View style={s.shopInfoTextBlock}>
                      <Text style={s.shopInfoTitle}>VFresh Grocery Store</Text>
                      <View style={s.shopInfoMeta}>
                        <Clock size={12} color={TEXT2} strokeWidth={2} />
                        <Text style={s.shopInfoMetaText}>Open 7 AM – 9 PM · Mon – Sun</Text>
                      </View>
                    </View>
                  </View>
                  <View style={s.shopInfoDivider} />
                  <View style={s.shopInfoTagsRow}>
                    <View style={s.shopInfoTag}>
                      <Leaf size={12} color={PRIMARY} strokeWidth={2} />
                      <Text style={s.shopInfoTagText}>Halal Certified</Text>
                    </View>
                    <View style={s.shopInfoTagSep} />
                    <View style={s.shopInfoTag}>
                      <Leaf size={12} color={PRIMARY} strokeWidth={2} />
                      <Text style={s.shopInfoTagText}>Farm Fresh Daily</Text>
                    </View>
                    <View style={s.shopInfoTagSep} />
                    <View style={s.shopInfoTag}>
                      <BadgeCheck size={12} color={PRIMARY} strokeWidth={2} />
                      <Text style={s.shopInfoTagText}>Quality Checked</Text>
                    </View>
                  </View>
                </View>

              </View>
            )}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: PAGE_BG },
  listContent: { padding: 12, paddingBottom: 20 },
  sectionGap:  { gap: 10 },

  cartErrorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderBottomWidth: 1, borderBottomColor: '#FECACA',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  cartErrorText: { fontFamily: FontFamily.regular, fontSize: 13, color: '#B91C1C', flex: 1 },

  // ── Items Card ───────────────────────────────────────────────────────────
  itemsCard:       { backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  itemsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  itemsCardLeft:   { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1 },
  itemsCardRight:  { fontFamily: FontFamily.regular, fontSize: 13, color: TEXT2 },
  itemsDivider:    { height: 1, backgroundColor: BORDER },

  // ── Header ───────────────────────────────────────────────────────────────
  headerBg: { backgroundColor: SURFACE, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  headerBackBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerCenter: { flex: 1, paddingLeft: 4 },
  headerTitle:  { fontFamily: FontFamily.bold, fontSize: 22, color: TEXT1, lineHeight: 28 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 28, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' },
  headerCartBtn: { width: 38, height: 38, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerCartBadge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: PRIMARY },
  headerCartBadgeText: { fontSize: 9, fontFamily: FontFamily.bold, color: PRIMARY, lineHeight: 12 },

  // ── Item Card ─────────────────────────────────────────────────────────────
  card:      { backgroundColor: SURFACE },
  cardInner: { flexDirection: 'row', padding: 16, gap: 14, alignItems: 'flex-start' },
  cardImgWrap: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#F8F8F8', flexShrink: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImg:      { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 6, left: 6, zIndex: 2, backgroundColor: '#4CAF50', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  discountText: { fontSize: 9, fontFamily: FontFamily.bold, color: '#fff' },
  cardBody:     { flex: 1, minWidth: 0 },
  cardNameRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  cardName:     { flex: 1, fontFamily: FontFamily.bold, fontSize: 14, color: TEXT1, lineHeight: 20 },
  trashBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ringWrap:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringContainer:  { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringBg:         { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 2.5, borderColor: '#E8E8E8' },
  ringArcWrapper: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, overflow: 'hidden' },
  ringArc: { position: 'absolute', top: 0, width: RING_SIZE, height: RING_SIZE / 2, borderTopLeftRadius: RING_SIZE / 2, borderTopRightRadius: RING_SIZE / 2, borderWidth: 2.5, borderBottomWidth: 0, borderColor: PRIMARY },
  stepperTrashSlot: { width: 30, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F5' },
  stockRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  stockText:   { fontFamily: FontFamily.semiBold, fontSize: 11, color: PRIMARY },

  priceBlock:  { flexShrink: 0, marginBottom: 10 },
  cardPrice:   { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1 },
  cardPerKg:   { fontFamily: FontFamily.regular, fontSize: 10, color: TEXT2, marginTop: 1 },

  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },

  stepper:     { flexDirection: 'row', alignItems: 'center', height: 32, borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: 'visible' },
  stepMinus:   { width: 30, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  stepMinusDisabled:     { backgroundColor: '#FAFAFA' },
  stepMinusText:         { fontSize: 18, lineHeight: 24, color: TEXT1, fontFamily: FontFamily.regular },
  stepMinusTextDisabled: { color: '#D0D0D0' },
  stepCount: { width: 30, height: 32, lineHeight: 32, textAlign: 'center', textAlignVertical: 'center', fontFamily: FontFamily.bold, fontSize: 13, color: TEXT1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: BORDER },
  stepPlus:     { width: 30, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY_DARK, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  stepPlusDisabled:      { backgroundColor: '#D0D0D0' },
  stepPlusText: { fontSize: 18, lineHeight: 24, color: '#fff', fontFamily: FontFamily.regular },
  stepPlusTextDisabled:  { color: '#F5F5F5' },
  lineTotalBlock: { alignItems: 'flex-end', flexShrink: 0, minWidth: 52 },
  lineTotal:      { fontFamily: FontFamily.bold, fontSize: 13, color: TEXT1 },
  lineEach:       { fontFamily: FontFamily.regular, fontSize: 10, color: TEXT2, marginTop: 2 },

  // ── Free Delivery banner ──────────────────────────────────────────────────
  freeDeliveryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_DARK, borderRadius: 12, padding: 18 },
  freeDeliveryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1.4, minWidth: 0 },
  freeDeliveryIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  freeDeliveryTitle: { fontFamily: FontFamily.bold, fontSize: 15, color: '#FFFFFF' },
  freeDeliverySub:   { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  freeDeliveryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 16 },
  freeDeliveryRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  freeDeliveryClockWrap: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  freeDeliveryMetaLabel: { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.5)', flexShrink: 1 },
  freeDeliveryTime: { fontFamily: FontFamily.bold, fontSize: 14, color: PRIMARY, marginVertical: 1 },

  // ── Shop Info card ────────────────────────────────────────────────────────
  shopInfoCard: { backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 18 },
  shopInfoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopInfoIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: PRIMARY_SURF, alignItems: 'center', justifyContent: 'center' },
  shopInfoTextBlock:{ flex: 1 },
  shopInfoTitle:    { fontFamily: FontFamily.bold, fontSize: 16, color: TEXT1 },
  shopInfoMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  shopInfoMetaText: { fontFamily: FontFamily.regular, fontSize: 12, color: TEXT2 },
  shopInfoDivider:  { height: 1, backgroundColor: BORDER, marginVertical: 8, marginHorizontal: -16 },
  shopInfoTagsRow:  { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-around' },
  shopInfoTag:      { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  shopInfoTagText:  { fontFamily: FontFamily.regular, fontSize: 11, color: TEXT2 },
  shopInfoTagSep:   { width: 1, alignSelf: 'stretch', backgroundColor: BORDER },

  // ── Billing ───────────────────────────────────────────────────────────────
  divider:           { height: 1, backgroundColor: BORDER, marginVertical: 10, marginHorizontal: -16 },
  billingCard:       { backgroundColor: SURFACE, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 18 },
  billingTitle:      { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1, marginBottom: 4 },
  billingRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  billingLabel:      { fontFamily: FontFamily.regular, fontSize: 13, color: TEXT2 },
  billingValue:      { fontFamily: FontFamily.semiBold, fontSize: 13, color: TEXT1 },
  billingTotalLabel: { fontFamily: FontFamily.bold, fontSize: 15, color: TEXT1 },
  billingTotalValue: { fontFamily: FontFamily.bold, fontSize: 18, color: TEXT1 },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: PRIMARY_DARK,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footerMain:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  footerLeft:       { flexShrink: 1, flex: 1 },
  footerTotalLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  footerTotalValue: { fontFamily: FontFamily.bold, fontSize: 22, color: '#FFFFFF', marginTop: 2 },
  footerSavings:    { fontFamily: FontFamily.regular, fontSize: 11, color: PRIMARY, marginTop: 3 },
  secureSub:        { fontFamily: FontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  termsNote:        { fontFamily: FontFamily.regular, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  footerTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
    marginHorizontal: -16,
  },
  footerTrustItem:  { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center' },
  footerTrustText:  { fontFamily: FontFamily.medium, fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  footerTrustSep: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginHorizontal: 4,
  },

  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, flexShrink: 1,
  },
  checkoutBtnText: { fontFamily: FontFamily.bold, fontSize: 14, color: '#fff' },

  // ── Empty ─────────────────────────────────────────────────────────────────
  empty:        { flex: 1, flexDirection: 'column', alignItems: 'stretch' },
  emptyImage:   { width: '100%', height: 320, alignSelf: 'center' },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyTitle:   { fontFamily: FontFamily.semiBold, fontSize: 20, color: TEXT1, textAlign: 'center' },
  shopRingBtn:  { marginTop: 16, paddingHorizontal: 22 },
});