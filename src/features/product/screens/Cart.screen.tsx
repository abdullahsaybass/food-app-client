import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, StatusBar,
  ActivityIndicator, Image, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Radius } from '../../../theme';
import { useProductStore } from '../store/product.store';
import { useAuthStore }    from '../../auth/store/auth.store';
import { formatPrice } from '../utils/product.utils';

// Height of your custom arch tab bar — adjust if you change it
const TAB_BAR_HEIGHT = 80;
const ARCH_RISE      = 38; // must match MainNavigator

export const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore(s => !!s.token);

  const cartItems   = useProductStore(s => s.cartItems);
  const cartTotal   = useProductStore(s => s.cartTotal);
  const cartLoading = useProductStore(s => s.cartLoading);
  const cartError   = useProductStore(s => s.cartError);
  const updateQty   = useProductStore(s => s.updateQuantity);
  const removeItem  = useProductStore(s => s.removeFromCart);
  const clearCart   = useProductStore(s => s.clearCart);

  const SHIPPING = cartTotal > 0 ? 30 : 0;
  const total    = cartTotal + SHIPPING;

  // ── Empty State ─────────────────────────────────────────────────────────────
  const EmptyCart = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add items from the home screen</Text>
    </View>
  );

  // ── Loading overlay ─────────────────────────────────────────────────────────
  const LoadingOverlay = () =>
    cartLoading ? (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    ) : null;

  // Bottom padding = custom tab bar height + device home indicator
  const bottomPad = TAB_BAR_HEIGHT + ARCH_RISE + insets.bottom;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart} disabled={cartLoading}>
            <Text style={[styles.clearText, cartLoading && { opacity: 0.4 }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error banner */}
      {cartError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {cartError}</Text>
        </View>
      ) : null}

      {cartItems.length === 0 && !cartLoading ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {cartItems.map(({ product, quantity }) => (
              <View key={product.id} style={styles.cartItem}>
                {/* Product image */}
                <View style={styles.itemImage}>
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.itemImageImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 32 }}>🛒</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={1}>{product.description}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
                </View>

                {/* Right — delete + qty stepper */}
                <View style={styles.itemRight}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeItem(product.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={cartLoading}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => updateQty(product.id, quantity - 1)}
                      disabled={cartLoading}
                    >
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepQty}>{quantity}</Text>

                    <TouchableOpacity
                      style={[styles.stepBtn, styles.stepBtnPlus]}
                      onPress={() => updateQty(product.id, quantity + 1)}
                      disabled={cartLoading}
                    >
                      <Text style={[styles.stepBtnText, { color: Colors.white }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* ── Checkout Panel ── */}
          {/* paddingBottom accounts for the custom arch tab bar sitting on top */}
          <View style={[styles.checkoutPanel, { paddingBottom: bottomPad }]}>
            {/* Promo code */}
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter Promo Code"
                placeholderTextColor={Colors.textDisabled}
              />
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Apply Code</Text>
              </TouchableOpacity>
            </View>

            {/* Price breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>{formatPrice(cartTotal)}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Shipping Fee</Text>
                <Text style={styles.priceValue}>{formatPrice(SHIPPING)}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabelBold}>Total</Text>
                <Text style={styles.priceTotalValue}>{formatPrice(total)}</Text>
              </View>
            </View>

            {/* ✅ Order Now button — was hidden behind tab bar, now has space */}
            <TouchableOpacity
              style={[styles.checkoutBtn, cartLoading && { opacity: 0.6 }]}
              activeOpacity={0.88}
              disabled={cartLoading}
              onPress={() => {
                if (!isLoggedIn) {
                  (navigation as any).navigate('Login');
                } else {
                  (navigation as any).navigate('Orders', {
                    screen:  'Checkout',
                    initial: false,
                  });
                }
              }}
            >
              <Text style={styles.checkoutBtnText}>Order Now 🛍️</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <LoadingOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { ...Typography.headingLarge, color: Colors.textPrimary },
  clearText:   { ...Typography.bodyMedium, color: Colors.error, fontWeight: '600' },

  errorBanner: {
    backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFEEBA',
  },
  errorBannerText: { ...Typography.bodySmall, color: '#856404' },

  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji:   { fontSize: 72 },
  emptyTitle:   { ...Typography.headingMedium, color: Colors.textPrimary },
  emptySubtitle:{ ...Typography.bodyMedium, color: Colors.textSecondary },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },

  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: 14, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, gap: 12,
  },
  itemImage: {
    width: 64, height: 64, borderRadius: Radius.md,
    backgroundColor: Colors.grey100, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  itemImageImg: { width: '100%', height: '100%' },
  itemInfo:  { flex: 1 },
  itemName:  { ...Typography.titleMedium, color: Colors.textPrimary, marginBottom: 3 },
  itemDesc:  { ...Typography.bodySmall,   color: Colors.textSecondary, marginBottom: 6 },
  itemPrice: { ...Typography.titleLarge,  color: Colors.textPrimary, fontWeight: '700' },

  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  deleteBtn: { padding: 4 },
  deleteIcon:{ fontSize: 18 },

  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.grey100, borderRadius: Radius.full,
    paddingHorizontal: 4, paddingVertical: 4,
  },
  stepBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  stepBtnPlus: { backgroundColor: Colors.primary },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
  stepQty: {
    ...Typography.titleMedium, color: Colors.textPrimary,
    minWidth: 20, textAlign: 'center', fontWeight: '700',
  },

  checkoutPanel: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 10000, zIndex: 10000,
    gap: 14,
  },
  promoRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden', height: 48,
  },
  promoInput: { flex: 1, paddingHorizontal: 16, ...Typography.bodyMedium, color: Colors.textPrimary },
  promoBtn:   {
    backgroundColor: Colors.navy, paddingHorizontal: 16,
    height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full,
  },
  promoBtnText: { ...Typography.bodyMedium, color: Colors.white, fontWeight: '700' },

  priceBreakdown: { gap: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel:      { ...Typography.bodyMedium, color: Colors.textSecondary },
  priceValue:      { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  priceLabelBold:  { ...Typography.titleLarge, color: Colors.textPrimary },
  priceTotalValue: { ...Typography.headingMedium, color: Colors.textPrimary, fontWeight: '800' },
  priceDivider:    { height: 1, backgroundColor: Colors.border },

  checkoutBtn: {
    height: 54, borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  checkoutBtnText: { ...Typography.labelLarge, color: Colors.white, fontSize: 16 },
});