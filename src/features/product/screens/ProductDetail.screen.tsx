import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors, Typography, Radius } from '../../../theme';
import { useProductStore } from '../store/product.store';
import { useAuthStore }    from '../../auth/store/auth.store';
import { productService } from '../services/product.service';
import { formatPrice, getDiscountedPrice } from '../utils/product.utils';
import { ProductCard } from '../components/ProductCard.component';
import type { ProductStackParamList } from '../../../app/navigation/navigation.types';
import type { Product } from '../types/product.types';

const { width } = Dimensions.get('window');
type Tab  = 'details' | 'support' | 'ratings';
type Props = NativeStackScreenProps<ProductStackParamList, 'ProductDetail'>;

// Height of your custom arch tab bar
const TAB_BAR_HEIGHT = 80;

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const insets = useSafeAreaInsets();

  // ── Product data ───────────────────────────────────────────────────────────
  const [product,   setProduct]   = useState<Product | null>(null);
  const [related,   setRelated]   = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  // ── Cart ───────────────────────────────────────────────────────────────────
  const addToCart = useProductStore(s => s.addToCart);
  const cartItems = useProductStore(s => s.cartItems);
  const updateQty = useProductStore(s => s.updateQuantity);
  const cartCount = useProductStore(s => s.cartCount);
  const isLoggedIn = useAuthStore(s => !!s.token);
  const cartItem  = cartItems.find(i => i.product.id === productId);

  // ── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService.getProduct(productId)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);

        try {
          const rel = await productService.listProducts({
            categoryId: p.categoryId,
            limit: 4,
          });
          if (!cancelled) {
            setRelated(rel.data.filter(r => r.id !== productId));
          }
        } catch { /* related is non-critical */ }
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [productId]);

  const handleRelatedPress = useCallback(
    (p: Product) => navigation.push('ProductDetail', { productId: p.id }),
    [navigation],
  );

  // Bottom padding for the addToCartBar so it clears the tab bar + arch rise
  const barBottomPad = TAB_BAR_HEIGHT + 38 + insets.bottom;

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: Colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const discountedPrice = getDiscountedPrice(product.price, product.discount);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ScrollView bottom padding = addToCartBar height + tab bar height */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: barBottomPad + 80 }}
      >
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.topBtnText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.topTitle} numberOfLines={1}>{product.name}</Text>

          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.topBtnText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Product Image Hero ────────────────────────────────────────────── */}
        <View style={styles.heroBox}>
          {product.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          ) : null}
          <Image
            source={{ uri: product.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* ── Product Info ──────────────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingVal}>{product.rating}</Text>
              <Text style={styles.ratingCount}>({product.reviewCount} Reviews)</Text>
            </View>
            {product.seller && <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>Seller: {product.seller}</Text>
            </>}
            {product.vendor && <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>Vendor: {product.vendor}</Text>
            </>}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(discountedPrice)}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
            {product.discount ? (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            ) : null}
          </View>

          {/* Qty selector — only shown when item is already in cart */}
          {cartItem ? (
            <View style={styles.qtySelector}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(product.id, cartItem.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{cartItem.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnPlus]}
                onPress={() => updateQty(product.id, cartItem.quantity + 1)}
              >
                <Text style={[styles.qtyBtnText, { color: Colors.white }]}>+</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── Tabs ── */}
          <View style={styles.tabRow}>
            {(['details', 'support', 'ratings'] as Tab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'details' && (
              <Text style={styles.description}>{product.description}</Text>
            )}
            {activeTab === 'support' && (
              <Text style={styles.description}>
                Contact our support team for any issues with this product.{'\n\n'}
                📧 support@freshmart.com{'\n'}
                📞 +1 (800) FRESH-01{'\n\n'}
                Returns accepted within 24 hours of delivery for fresh items.
              </Text>
            )}
            {activeTab === 'ratings' && (
              <View>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNum}>{product.rating}</Text>
                  <View>
                    <Text style={{ fontSize: 24 }}>⭐⭐⭐⭐⭐</Text>
                    <Text style={styles.ratingBigCount}>{product.reviewCount} reviews</Text>
                  </View>
                </View>
                {[5, 4, 3, 2, 1].map(star => (
                  <View key={star} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarLabel}>{star}★</Text>
                    <View style={styles.ratingBarBg}>
                      <View style={[styles.ratingBarFill, { width: `${star * 18}%` as any }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Related ── */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>You Might Also Like</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {related.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onPress={handleRelatedPress}
                    style={{ width: 160 }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart ────────────────────────────────────────────── */}
      {/* paddingBottom clears the custom arch tab bar that sits on top */}
      <View style={[styles.addToCartBar, { paddingBottom: barBottomPad }]}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            {cartItem
              ? formatPrice(discountedPrice * cartItem.quantity)
              : formatPrice(discountedPrice)}
          </Text>
        </View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => addToCart(product)}
            activeOpacity={0.88}
          >
            <Text style={styles.addToCartText}>
              {cartItem ? 'Add More' : 'Add to Cart'} 🛒
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderNowBtn}
            onPress={() => {
              if (!isLoggedIn) {
                (navigation as any).navigate('Login');
                return;
              }
              // addToCart optimistically updates the store immediately (no await needed)
              // Checkout will see the item right away; API syncs in the background
              addToCart(product);
              (navigation as any).navigate('Orders', {
                screen:  'Checkout',
                initial: false,
              });
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.orderNowText}>Order Now ⚡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { ...Typography.headingMedium, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  topBtnText: { fontSize: 18 },
  topTitle:   { ...Typography.titleLarge, color: Colors.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '800' },

  heroBox: {
    height: 260, backgroundColor: Colors.white,
    marginHorizontal: 20, borderRadius: Radius.xl, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  heroImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', top: 14, left: 14, zIndex: 1,
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },

  infoCard: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -16, paddingHorizontal: 24, paddingTop: 28, minHeight: 400,
  },
  productName: { ...Typography.headingLarge, color: Colors.textPrimary, marginBottom: 10 },

  metaRow:   { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  ratingChip:{ flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStar:{ fontSize: 13 },
  ratingVal: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '700' },
  ratingCount:{ ...Typography.bodySmall, color: Colors.textSecondary },
  metaDot:   { color: Colors.textDisabled },
  metaText:  { ...Typography.bodySmall, color: Colors.textSecondary },

  priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  price:         { ...Typography.headingLarge, color: Colors.textPrimary, fontWeight: '800' },
  unit:          { ...Typography.bodyMedium, color: Colors.textSecondary },
  originalPrice: { ...Typography.bodyMedium, color: Colors.textDisabled, textDecorationLine: 'line-through' },

  qtySelector: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20,
    alignSelf: 'flex-start', backgroundColor: Colors.grey100,
    borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 4,
  },
  qtyBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  qtyBtnPlus: { backgroundColor: Colors.primary },
  qtyBtnText: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700', lineHeight: 24 },
  qtyVal:     { ...Typography.headingMedium, color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },

  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: Colors.border, marginBottom: 16,
  },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive:   { borderBottomColor: Colors.primary },
  tabText:     { ...Typography.bodyMedium, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive:{ color: Colors.primary },
  tabContent:  { marginBottom: 28 },
  description: { ...Typography.bodyLarge, color: Colors.textSecondary, lineHeight: 24 },

  ratingBig:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  ratingBigNum:  { ...Typography.displayMedium, color: Colors.textPrimary },
  ratingBigCount:{ ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  ratingBarRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  ratingBarLabel:{ ...Typography.bodySmall, color: Colors.textSecondary, width: 24 },
  ratingBarBg:   { flex: 1, height: 6, backgroundColor: Colors.grey100, borderRadius: 3 },
  ratingBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  relatedSection:{ marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { ...Typography.headingMedium, color: Colors.textPrimary },
  seeAll:        { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },

  addToCartBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 10000,
    zIndex: 10000,
  },
  totalLabel:   { ...Typography.bodySmall, color: Colors.textSecondary },
  totalPrice:   { ...Typography.headingMedium, color: Colors.textPrimary, fontWeight: '800' },
  addToCartBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: Radius.full, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  addToCartText: { ...Typography.labelLarge, color: Colors.white },
  actionBtns: { flexDirection: 'row', gap: 10 },
  orderNowBtn: {
    backgroundColor: Colors.white, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary,
  },
  orderNowText: { ...Typography.labelLarge, color: Colors.primary },
});