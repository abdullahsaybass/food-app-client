import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useProductStore } from '../store/product.store';
import { productService } from '../services/product.service';
import { Colors } from '@/src/theme/index';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import type { Product, ProductVariant } from '../types/product.types';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetail'
>;

// Matches the dark navy CTA bar in the screenshot
const NAVY            = '#111827';
const PRIMARY         = '#16A34A';
const ACTIVE_BORDER   = '#111827';
const GREEN_BADGE     = '#4CAF50';

const formatMVR = (amount: number) => `MVR ${amount.toFixed(2)}`;
const calcPrice = (price: number, pct: number) =>
  pct > 0 ? Math.round(price * (1 - pct / 100)) : price;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ── Tag icon map (matches screenshot chip icons) ──────────────────────────────
const TAG_ICON_MAP: Record<string, { icon: string; color: string; bg: string }> = {
  beef:   { icon: 'food-steak',        color: '#EF4444', bg: '#FEE2E2' },
  halal:  { icon: 'leaf',              color: '#16A34A', bg: '#DCFCE7' },
  frozen: { icon: 'snowflake',         color: '#3B82F6', bg: '#DBEAFE' },
  meat:   { icon: 'food-drumstick',    color: '#8B5CF6', bg: '#EDE9FE' },
  fresh:  { icon: 'sprout',            color: '#16A34A', bg: '#DCFCE7' },
  vegan:  { icon: 'leaf',              color: '#16A34A', bg: '#DCFCE7' },
};
const getTagStyle = (tag: string) =>
  TAG_ICON_MAP[tag.toLowerCase()] ?? { icon: 'tag-outline', color: '#6B7280', bg: '#F3F4F6' };

// ── Related Product Card ──────────────────────────────────────────────────────
const RelatedProductCard: React.FC<{ item: Product; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={relS.card} onPress={onPress} activeOpacity={0.85}>
    <Image source={{ uri: item.image }} style={relS.image} resizeMode="cover" />
    <View style={relS.info}>
      <Text style={relS.name} numberOfLines={2}>{item.name}</Text>
      <View style={relS.ratingRow}>
        <MaterialCommunityIcons name="star" size={11} color="#F59E0B" />
        <Text style={relS.ratingText}>{item.rating}</Text>
      </View>
      <Text style={relS.price}>{formatMVR(item.variants?.[0]?.price || 0)}</Text>
    </View>
  </TouchableOpacity>
);

const relS = StyleSheet.create({
  card:       { width: 130, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: '#F3F4F6', marginRight: 10, overflow: 'hidden' },
  image:      { width: '100%', height: 100 },
  info:       { padding: 8 },
  name:       { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, lineHeight: 17 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  ratingText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  price:      { fontSize: 12, fontWeight: '700', color: '#111827' },
});

// ── Related Products ──────────────────────────────────────────────────────────
const RelatedProducts: React.FC<{
  productId: string;
  category: string;
  onProductPress: (id: string) => void;
}> = ({ productId, category, onProductPress }) => {
  const [items, setItems]     = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService
      .listProducts({ limit: 10, categoryId: category })
      .then(res => {
        if (cancelled) return;
        setItems(res.data.filter((i: Product) => i.id !== productId));
      })
      .catch(console.log)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId, category]);

  if (loading) return (
    <View style={{ marginTop: 24 }}>
      <Text style={rpS.heading}>Related Products</Text>
      <ActivityIndicator size="small" color={PRIMARY} style={{ marginTop: 12 }} />
    </View>
  );

  if (!items.length) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={rpS.heading}>Related Products</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <RelatedProductCard item={item} onPress={() => onProductPress(item.id)} />
        )}
      />
    </View>
  );
};

const rpS = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});

// ── Tabs — Details / Description / Reviews ────────────────────────────────────
// Matches the 3-tab row in the screenshot
type TabKey = 'details' | 'description' | 'reviews';

const ProductDetailTabs: React.FC<{
  product: any;
  selectedVariant: any;
}> = ({ product, selectedVariant }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'details',     label: 'Details',     icon: 'information-outline' },
    { key: 'description', label: 'Description', icon: 'text-box-outline' },
    { key: 'reviews',     label: `Reviews (0)`, icon: 'star-outline' },
  ];

  return (
    <View style={tabS.wrapper}>
      {/* Tab Bar */}
      <View style={tabS.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[tabS.tab, activeTab === t.key && tabS.tabActive]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={t.icon}
              size={15}
              color={activeTab === t.key ? NAVY : '#9CA3AF'}
            />
            <Text style={[tabS.tabText, activeTab === t.key && tabS.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Details tab — two-column grid matching screenshot */}
      {activeTab === 'details' && (
        <View style={tabS.detailsGrid}>
          {[
            product.brand          && { label: 'Brand',            value: product.brand },
            product.halal          && { label: 'Halal',            value: 'Yes' },
            product.quality        && { label: 'Quality',          value: product.quality },
            product.frozen         && { label: 'Storage Type',     value: 'Frozen' },
            selectedVariant?.weight && {
              label: 'Weight',
              value: `${selectedVariant.weight}${selectedVariant.weightUnit ?? ''}`,
            },
            product.usageInstruction && { label: 'Usage Instruction',   value: product.usageInstruction },
            selectedVariant?.caseQuantity && {
              label: 'Case Quantity',
              value: String(selectedVariant.caseQuantity),
            },
            product.storageInstruction && { label: 'Storage Instruction', value: product.storageInstruction },
          ]
            .filter(Boolean)
            .map((item: any, idx: number) => (
              <View key={idx} style={tabS.detailCell}>
                <View style={tabS.detailIcon}>
                  <MaterialCommunityIcons
                    name={
                      item.label === 'Brand'              ? 'tag-outline' :
                      item.label === 'Halal'              ? 'leaf' :
                      item.label === 'Quality'            ? 'medal-outline' :
                      item.label === 'Storage Type'       ? 'snowflake' :
                      item.label === 'Weight'             ? 'weight' :
                      item.label === 'Case Quantity'      ? 'package-variant' :
                      item.label === 'Usage Instruction'  ? 'silverware-fork-knife' :
                      item.label === 'Storage Instruction'? 'thermometer' :
                      'information-outline'
                    }
                    size={18}
                    color="#6B7280"
                  />
                </View>
                <View style={tabS.detailText}>
                  <Text style={tabS.detailLabel}>{item.label}</Text>
                  <Text style={tabS.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Description tab */}
      {activeTab === 'description' && (
        <Text style={tabS.descText}>{product.description}</Text>
      )}

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        submitted ? (
          <View style={tabS.successBox}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#22C55E" />
            <Text style={tabS.successTitle}>Review Added!</Text>
            <Text style={tabS.successSub}>Thank you for your feedback.</Text>
          </View>
        ) : (
          <View>
            <View style={tabS.starRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRating(n)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name={n <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
              {rating > 0 && (
                <Text style={tabS.ratingLabel}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </Text>
              )}
            </View>
            <TextInput
              style={tabS.input}
              placeholder="Share your experience..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[tabS.submitBtn, (rating === 0 || !comment.trim()) && tabS.submitBtnDisabled]}
              onPress={() => { if (rating && comment.trim()) setSubmitted(true); }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="send" size={16} color="#fff" />
              <Text style={tabS.submitBtnText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const tabS = StyleSheet.create({
  wrapper:  { marginTop: 24 },

  // Tab bar — underline style matching screenshot
  tabBar:   { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 16 },
  tab:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:{ borderBottomColor: NAVY },
  tabText:  { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: NAVY, fontWeight: '700' },

  // Details — 2-column grid matching screenshot's info section
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  detailCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center', justifyContent: 'center',
  },
  detailText:  { flex: 1, gap: 2 },
  detailLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#111827', fontWeight: '700', lineHeight: 18 },

  // Description
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 22 },

  // Reviews
  starRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  ratingLabel:  { fontSize: 13, fontWeight: '600', color: '#F59E0B', marginLeft: 4 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 14, color: Colors.textPrimary,
    minHeight: 100, marginBottom: 14, width: '100%',
  },
  submitBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: NAVY, borderRadius: 12, paddingVertical: 13, width: '100%' },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText:     { fontSize: 14, fontWeight: '700', color: '#fff' },
  successBox:        { alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 28, borderWidth: 1, borderColor: '#BBF7D0' },
  successTitle:      { fontSize: 16, fontWeight: '800', color: '#15803D' },
  successSub:        { fontSize: 13, color: '#16A34A' },
});

// ─────────────────────────────────────────────────────────────────────────────
export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const insets = useSafeAreaInsets();

  const [product,         setProduct]         = useState<Product | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity,        setQuantity]        = useState(1);
  const [imageIndex,      setImageIndex]      = useState(0);
  const [searchQuery,     setSearchQuery]     = useState('');

  const addToCart  = useProductStore(s => s.addToCart);
  const cartCount  = useProductStore(s => s.cartCount);

  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product || !product.inStock || !selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService.getProduct(productId)
      .then(p => {
        if (cancelled) return;
        setProduct(p);
        const cheapest = p.variants.length
          ? [...p.variants].sort((a: ProductVariant, b: ProductVariant) => a.price - b.price)[0]
          : null;
        setSelectedVariant(cheapest);
        setQuantity(cheapest?.minOrderQuantity ?? 1);
      })
      .catch((e: any) => { if (!cancelled) setError(e.message ?? 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.centered}><ActivityIndicator size="large" color={PRIMARY} /></View>
    </SafeAreaView>
  );

  if (error || !product) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.centered}>
        <Text style={s.errorText}>{error ?? 'Product not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: PRIMARY }}>Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (!product.variants?.length || !selectedVariant) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.centered}>
        <Text style={s.errorText}>This product has no variants.{'\n'}Please contact support.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: PRIMARY }}>Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const discountedPrice   = calcPrice(selectedVariant.price, product.discountPercentage);
  const originalTotal     = selectedVariant.price * quantity;
  const totalPrice        = discountedPrice * quantity;
  const hasDiscount       = product.discountPercentage > 0;
  const images            = product.images?.length ? product.images : [{ url: product.image }];
  const BOTTOM_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 16);
  const tags: string[]    = product.tags ?? [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: BOTTOM_BAR_HEIGHT + 16 }}
        >
          {/* ── Top Nav ── */}
          <View style={s.topNav}>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="arrow-back-ios" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Spacer / title area */}
            <View style={{ flex: 1 }} />

            {/* Wishlist + Share + Cart icons — matching screenshot */}
            <TouchableOpacity style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="heart-outline" size={20} color={Colors.grey700} />
            </TouchableOpacity>
           <TouchableOpacity
              style={s.navBtn}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'Cart',
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="cart-outline" size={20} color={Colors.grey700} />
              {cartCount > 0 && (
                <View style={s.cartBadge}>
                  <Text style={s.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Image Carousel — full-width, rounded, with -10% badge ── */}
          <View style={s.imageWrapper}>
            {/* Green discount badge — top-left, matching screenshot */}
            {hasDiscount && (
              <View style={s.discountBadge}>
                <Text style={s.discountBadgeText}>-{product.discountPercentage}% OFF</Text>
              </View>
            )}

            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e =>
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
            >
              {images.map((img: any, i: number) => (
                <Image
                  key={i}
                  source={{ uri: img.url }}
                  style={[s.productImage, { width }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Dot indicators — matching screenshot */}
            {images.length > 1 && (
              <View style={s.dotsRow}>
                {images.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[s.dot, i === imageIndex && s.dotActive]}
                  />
                ))}
              </View>
            )}

            {/* Paginator pill — "1 / 4" */}
            {images.length > 1 && (
              <View style={s.paginator}>
                <Text style={s.paginatorText}>{imageIndex + 1}/{images.length}</Text>
              </View>
            )}
          </View>

          {/* ── Detail Card — white, lifts over image ── */}
          <View style={s.card}>

            {/* Featured label — orange "FEATURED" row */}
            {product.featured && (
              <View style={s.featuredRow}>
                <MaterialCommunityIcons name="star" size={13} color="#F59E0B" />
                <Text style={s.featuredText}>FEATURED</Text>
              </View>
            )}

            {/* Product name + action icons */}
            <View style={s.nameRow}>
              <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
              <View style={s.nameActions}>
                <TouchableOpacity style={s.iconCircle}>
                  <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={s.iconCircle}>
                  <MaterialCommunityIcons name="bookmark-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description subtitle */}
            {!!product.description && (
              <Text style={s.descSubtitle} numberOfLines={2}>{product.description}</Text>
            )}

            {/* Tags — icon chips matching screenshot */}
            {tags.length > 0 && (
              <View style={s.tagsRow}>
                {tags.map(tag => {
                  const ts = getTagStyle(tag);
                  return (
                    <View key={tag} style={[s.tagPill, { backgroundColor: ts.bg }]}>
                      <MaterialCommunityIcons name={ts.icon} size={12} color={ts.color} />
                      <Text style={[s.tagPillText, { color: ts.color }]}>{capitalize(tag)}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Variant chips — kg / case etc */}
            <View style={s.variantRow}>
              {product.variants.map((v: ProductVariant) => {
                const isSelected = selectedVariant?.unit === v.unit;
                return (
                  <TouchableOpacity
                    key={v.sku || v.unit}
                    style={[s.variantChip, isSelected && s.variantChipActive]}
                    onPress={() => {
                      setSelectedVariant(v);
                      setQuantity(v.minOrderQuantity ?? 1);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.variantChipText, isSelected && s.variantChipTextActive]}>
                      {v.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Price / Stock / Quantity row — matching screenshot card ── */}
            <View style={s.pricingCard}>
              {/* PRICE */}
              <View style={s.pricingCol}>
                <Text style={s.pricingLabel}>PRICE</Text>
                <Text style={s.finalPrice}>{formatMVR(totalPrice)}</Text>
                {hasDiscount && (
                  <View style={s.strikePriceRow}>
                    <Text style={s.strikePrice}>{formatMVR(originalTotal)}</Text>
                    <View style={s.discountChip}>
                      <Text style={s.discountChipText}>-{product.discountPercentage}%</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View style={s.pricingDivider} />

              {/* STOCK */}
              <View style={s.pricingCol}>
                <Text style={s.pricingLabel}>STOCK</Text>
                <View style={s.stockRow}>
                  <MaterialCommunityIcons
                    name={product.inStock ? 'check-circle' : 'close-circle'}
                    size={16}
                    color={product.inStock ? '#16A34A' : '#EF4444'}
                  />
                  <Text style={[s.stockValue, !product.inStock && s.stockValueNo]}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>
                {product.inStock && (
                  <Text style={s.readyToShip}>Ready to ship</Text>
                )}
              </View>

              {/* Divider */}
              <View style={s.pricingDivider} />

              {/* QUANTITY stepper */}
              <View style={s.pricingCol}>
                <Text style={s.pricingLabel}>QUANTITY</Text>
                <View style={s.qtyBox}>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => setQuantity(q => Math.max(selectedVariant.minOrderQuantity ?? 1, q - 1))}
                  >
                    <MaterialIcons name="remove" size={16} color={Colors.grey700} />
                  </TouchableOpacity>
                  <Text style={s.qtyVal}>{quantity}</Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => setQuantity(q => q + 1)}
                  >
                    <MaterialIcons name="add" size={16} color={Colors.grey700} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ── Tabs: Details / Description / Reviews ── */}
            <ProductDetailTabs product={product} selectedVariant={selectedVariant} />

            {/* ── Related Products ── */}
            <RelatedProducts
              productId={productId}
              category={product.category}
              onProductPress={id => (navigation as any).push('ProductDetail', { productId: id })}
            />
          </View>
        </ScrollView>
      </View>

      {/* ── Bottom Bar — dark navy, full-width, matching screenshot ── */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        {/* Support link */}
        <TouchableOpacity style={s.supportBtn}>
          <MaterialCommunityIcons name="headset" size={18} color="#6B7280" />
          <Text style={s.supportText}>Support</Text>
        </TouchableOpacity>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            s.addToCartBtn,
            !product.inStock && s.btnOutOfStock,
            justAdded && s.btnAddedToCart,
          ]}
          onPress={handleAddToCart}
          activeOpacity={0.88}
          disabled={!product.inStock}
        >
          <MaterialCommunityIcons
            name={justAdded ? 'check-circle' : 'cart-outline'}
            size={20}
            color="#fff"
          />
          <Text style={s.addToCartText}>
            {!product.inStock ? 'Out of Stock' : justAdded ? 'Added!' : 'Add to Cart'}
          </Text>
          <View style={s.btnPriceDivider} />
          <Text style={s.btnPriceText}>{formatMVR(totalPrice)}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#fff' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },

  // ── Nav — back + heart + cart ──
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff',
  },
  cartBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800', lineHeight: 12 },

  // ── Image — full width, taller, no border-radius crop ──
  imageWrapper: {
    height: 340,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  productImage:  { height: 340 },

  // Green discount badge top-left
  discountBadge: {
    position: 'absolute', top: 14, left: 14, zIndex: 2,
    backgroundColor: GREEN_BADGE, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  discountBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  // Dot indicators
  dotsRow: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    flexDirection: 'row', gap: 6,
  },
  dot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotActive: { backgroundColor: NAVY, width: 18 },

  // Paginator pill bottom-right
  paginator: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  paginatorText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16,
  },

  // Featured badge — orange star + text
  featuredRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8,
  },
  featuredText: { fontSize: 11, fontWeight: '700', color: '#F59E0B', letterSpacing: 0.8 },

  // Name row with share/bookmark
  nameRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 8, marginBottom: 6,
  },
  productName: {
    flex: 1, fontSize: 22, fontWeight: '800',
    color: '#111827', lineHeight: 30,
  },
  nameActions:  { flexDirection: 'row', gap: 6, paddingTop: 2 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },

  descSubtitle: {
    fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 12,
    fontWeight: '400',
  },

  // Tags — coloured pill chips with icon
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20,
  },
  tagPillText: { fontSize: 12, fontWeight: '600' },

  // Variant chips
  variantRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  variantChip:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  variantChipActive:     { borderColor: NAVY, backgroundColor: '#fff' },
  variantChipText:       { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  variantChipTextActive: { color: NAVY, fontWeight: '700' },

  // ── Pricing card — 3-column row ──
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
    overflow: 'hidden',
  },
  pricingCol:     { flex: 1, padding: 12, gap: 4 },
  pricingDivider: { width: 1, backgroundColor: '#E5E7EB' },
  pricingLabel: {
    fontSize: 10, fontWeight: '700',
    color: '#9CA3AF', letterSpacing: 0.8,
  },

  finalPrice: { fontSize: 16, fontWeight: '800', color: '#111827' },
  strikePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strikePrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  // Green discount chip inline, matching screenshot
  discountChip: { backgroundColor: '#DCFCE7', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  discountChipText: { fontSize: 9, fontWeight: '700', color: '#16A34A' },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockValue:   { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  stockValueNo: { color: '#EF4444' },
  readyToShip:  { fontSize: 11, color: '#6B7280', fontWeight: '400' },

  qtyBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, overflow: 'hidden',
    backgroundColor: '#fff', alignSelf: 'flex-start',
  },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyVal: { minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#111827' },

  // ── Bottom Bar — dark navy ──
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 0,
  },

  // Support button — left side of bar
  supportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6,
  },
  supportText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  // Add to Cart button — flex-1, shows icon + label + price
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  btnAddedToCart:  { backgroundColor: '#15803D', borderColor: 'transparent', opacity: 0.85 },
  btnOutOfStock:   { backgroundColor: '#6B7280', borderColor: 'transparent' },
  addToCartText:   { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Price divider + price on right of button
  btnPriceDivider: { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 4 },
  btnPriceText:    { fontSize: 14, fontWeight: '800', color: '#fff' },
});