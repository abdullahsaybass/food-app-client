import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
  ActivityIndicator, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../../theme';
import { ProductCard } from '../components/ProductCard.component';
import { BannerCarousel } from '../components/Banner.component';
import { CategoryList, STATIC_CATEGORIES } from '../components/CategoryList.component';
import { useAuthStore } from '../../auth/store/auth.store';
import { useProductStore } from '../store/product.store';
import { useNotificationStore } from '../../notification/store/notification.store';
import { productService } from '../services/product.service';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import type { Product, Category } from '../types/product.types';
import banner2 from '@/assets/images/delivery.png';
import { FontFamily } from '../../../theme/typography';
import Homefooter from '../components/Home.footer';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

const PRIMARY = '#2E7D32';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STRIP_H      = 16;  // unified horizontal margin — matches banner/grid/header
const STRIP_GAP    = 8;   // gap between cards in the slider
const STRIP_COLUMNS_VISIBLE = 3; // 3 cards fill exactly the banner width (SCREEN_WIDTH - 16*2)
const STRIP_CARD_W = (SCREEN_WIDTH - STRIP_H * 2 - STRIP_GAP * (STRIP_COLUMNS_VISIBLE - 1)) / STRIP_COLUMNS_VISIBLE;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBell = ({ color = '#1a1a1a', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCart = ({ color = '#1a1a1a', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSearch = ({ color = '#9CA3AF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={2} />
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconLocation = ({ color = '#2E7D32', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth="2" />
  </Svg>
);

const IconPerson = ({ color = '#fff', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth="1.8" />
  </Svg>
);

// ─── CategoryStrip ────────────────────────────────────────────────────────────

interface StripProps {
  categoryId: string;
  title:      string;
  imageUri?:  string;
  onPress:    (p: Product) => void;
}

const CategoryStrip: React.FC<StripProps> = ({ categoryId, title, imageUri, onPress }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading,  setLoading]  = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // ✅ Pass categoryId directly to backend — no client-side filtering
    productService.listProducts({ categoryId, limit: 20 })
      .then(res => { if (!cancelled) setProducts(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.section}>

      {/* Category name + View All */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryId, categoryName: title })}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Products — horizontal slider constrained to banner width */}
      {loading
        ? <ActivityIndicator color={PRIMARY} style={{ marginLeft: STRIP_H }} />
        : <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hGrid}
            style={{ marginHorizontal: STRIP_H }}
          >
            {products.slice(0, 5).map(p => (
              <ProductCard key={p.id} product={p} onPress={onPress} style={{ width: STRIP_CARD_W }} />
            ))}
          </ScrollView>
      }
    </View>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export const HomeScreen: React.FC<Props> = (props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search,            setSearch]           = useState('');
  const [filteredProducts,  setFilteredProducts] = useState<Product[]>([]);
  const [popularProducts,   setPopularProducts]  = useState<Product[]>([]);
  const [categoryProducts,  setCategoryProducts] = useState<Product[]>([]);
  const [popularLoading,    setPopularLoading]   = useState(false);
  const [categoryLoading,   setCategoryLoading]  = useState(false);
  const [popularError,      setPopularError]     = useState<string | null>(null);
  const [categoryError,     setCategoryError]    = useState<string | null>(null);
  const [apiCategories,     setApiCategories]    = useState<Category[]>([]);

  const user        = useAuthStore(s => s.user);
  const cartItems   = useProductStore(s => s.cartItems);
  const fetchCart   = useProductStore(s => s.fetchCart);
  const cartQty     = cartItems.length;
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const fetchNotifications = useNotificationStore(s => s.fetch);

  useEffect(() => { fetchCart(); }, []);
  useEffect(() => { fetchNotifications(); }, []);
console.log('productService =', productService);
  // Load categories
  useEffect(() => {
    productService.getCategories()
      .then(cats => setApiCategories(cats))
      .catch(() => {});
  }, []);

  // Load popular / best selling — fetch a larger pool, then cap to 2 per category client-side
  useEffect(() => {
    let cancelled = false;
    setPopularLoading(true);
    setPopularError(null);
    productService.listProducts({ popular: true, limit: 50 })
      .then(res => { if (!cancelled) setPopularProducts(res.data); })
      .catch(err => { if (!cancelled) setPopularError(err.message); })
      .finally(() => { if (!cancelled) setPopularLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Load products for selected category tab
  useEffect(() => {
    let cancelled = false;
    setCategoryLoading(true);
    setCategoryError(null);
    // ✅ Pass categoryId to backend — no fetching 100+ and filtering client-side
    productService.listProducts({
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 20,
    })
      .then(res => { if (!cancelled) setCategoryProducts(res.data); })
      .catch(err => { if (!cancelled) setCategoryError(err.message); })
      .finally(() => { if (!cancelled) setCategoryLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory]);

  // Search filter
  useEffect(() => {
    const pool = selectedCategory === 'all' ? popularProducts : categoryProducts;
    if (!search.trim()) { setFilteredProducts(pool); return; }
    setFilteredProducts(pool.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, popularProducts, categoryProducts, selectedCategory]);

  const handleProductPress = useCallback(
    (product: Product) => navigation.navigate('ProductDetail', { productId: product.id }),
    [],
    
  );

  // ✅ Best Selling: max 2 products per category, preserving the order they came in
  const bestSellingProducts = React.useMemo(() => {
    const seenCount: Record<string, number> = {};
    const result: Product[] = [];
    for (const p of popularProducts) {
      const key = p.categoryId ?? 'uncategorized';
      seenCount[key] = (seenCount[key] ?? 0) + 1;
      if (seenCount[key] <= 2) result.push(p);
    }
    return result;
  }, [popularProducts]);

    console.log('productService =', productService);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.topBar}>
          <View style={styles.userRow}>
            <View style={styles.avatarWrap}>
              {user?.profilePic?.url ? (
                <Image source={{ uri: user.profilePic.url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  {user?.name ? (
                    <Text style={styles.avatarInitial}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  ) : (
                    <IconPerson color="#fff" size={22} />
                  )}
                </View>
              )}
            </View>
            <View>
              <Text style={styles.greeting}>{user?.name ? `Hello, ${user.name} 👋` : 'Welcome 👋'}</Text>
              <Text style={styles.welcomeText}>Welcome back!</Text>
            </View>
          </View>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => (navigation as any).navigate('Notifications')}>
              <IconBell color="#1a1a1a" size={22} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Cart' })}
            >
              <IconCart color="#1a1a1a" size={22} />
              {cartQty > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartQty > 9 ? '9+' : cartQty}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <IconSearch color="#9CA3AF" size={18} />
            <TextInput
              placeholder="Search for products..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* ── Deliver to ── */}
        <TouchableOpacity
          style={styles.deliverRow}
          onPress={() => (navigation as any).navigate('SelectAddress')}
        >
          <IconLocation color={PRIMARY} size={16} />
          <Text style={styles.deliverLabel}>Deliver to </Text>
          <Text style={styles.deliverLocation}>Home ▾</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.changeBtn}>Change</Text>
        </TouchableOpacity>

        {/* ── Search results ── */}
        {search.trim() ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Results for "{search}"</Text>
            </View>
            {filteredProducts.length > 0
              ? <View style={styles.grid}>
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onPress={handleProductPress} />
                  ))}
                </View>
              : <View style={styles.centeredMsg}>
                  <Text style={styles.emptyTitle}>No results found</Text>
                  <Text style={styles.emptyText}>Try a different keyword.</Text>
                </View>
            }
          </View>
        ) : (
          <>
            {/* ── Banner carousel ── */}
            <View style={styles.section}>
              <BannerCarousel />
            </View>

            {/* ── Category tabs ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryId: 'all', categoryName: 'All Products' })}>
                  <Text style={styles.viewAll}>View All →</Text>
                </TouchableOpacity>
              </View>
              <CategoryList
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                categories={apiCategories}
              />
            </View>

            {/* ── Best Selling ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best Selling</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryId: 'popular', categoryName: 'Best Selling' })}>
                  <Text style={styles.viewAll}>View All →</Text>
                </TouchableOpacity>
              </View>
              {popularLoading
                ? <ActivityIndicator color={PRIMARY} style={{ marginLeft: 20 }} />
                : popularError
                  ? <View style={styles.centeredMsg}>
                      <Text style={styles.emptyText}>{popularError}</Text>
                    </View>
                  : <View style={styles.grid}>
                      {bestSellingProducts.map(p => (
                        <ProductCard key={p.id} product={p} onPress={handleProductPress} />
                      ))}
                    </View>
              }
            </View>

            {/* ── Per-category strips ── */}
            {(apiCategories.length > 0 ? apiCategories : STATIC_CATEGORIES)
              .filter(cat => cat.id !== 'all')
              .map(cat => (
                <CategoryStrip
                  key={`strip-${cat.id}`}
                  categoryId={cat.id}
                  title={cat.name}
                  // ✅ banner is a distinct field from the category's circular icon (`image`).
                  // If the admin hasn't uploaded a banner, this is undefined and the strip
                  // renders with no banner — name + products only.
                  imageUri={cat.banner}
                  onPress={handleProductPress}
                />
              ))}

            {/* ── Promo banner (Free Delivery) — moved to last ── */}
            <View style={styles.section}>
              <TouchableOpacity activeOpacity={0.9} style={styles.promoBannerWrap}>
                <Image source={banner2} style={styles.promoBannerImage} resizeMode="cover" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 8 },

  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  userRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap:     { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: '#eee' },
  avatarImg:      { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: FontFamily.bold },
  greeting:       { fontSize: 13, color: '#888', fontFamily: FontFamily.regular },
  welcomeText:    { fontSize: 19, fontWeight: '800', color: '#1a1a1a', fontFamily: FontFamily.bold },

  iconGroup: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', fontFamily: FontFamily.bold },

  searchRow: { paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5', borderRadius: 8,
    paddingHorizontal: 16, height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', fontFamily: FontFamily.regular },

  deliverRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  deliverLabel:    { fontSize: 13, color: '#555', marginLeft: 6, fontFamily: FontFamily.regular },
  deliverLocation: { fontSize: 13, fontWeight: '700', color: PRIMARY, fontFamily: FontFamily.bold },
  changeBtn:       { fontSize: 13, fontWeight: '600', color: PRIMARY, fontFamily: FontFamily.bold },

  section:       { marginTop: 20, width: '100%', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: STRIP_H, marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: '#1a1a1a', fontFamily: FontFamily.bold },
  viewAll:       { fontSize: 13, fontWeight: '600', color: PRIMARY, fontFamily: FontFamily.bold },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, columnGap: 8, rowGap: 8,
  },

  hGrid: {
    flexDirection: 'row',
    gap: STRIP_GAP,
  },

  centeredMsg: { paddingHorizontal: 16, paddingVertical: 32, alignItems: 'center' },
  emptyText:   { color: '#7A7A7A', textAlign: 'center', fontSize: 14, fontFamily: FontFamily.regular },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, fontFamily: FontFamily.bold },

  promoBannerWrap:  { alignSelf: 'center', width: '100%', borderRadius: 8, overflow: 'hidden' },
  promoBannerImage: { width: '100%', height: 200 },

  stripBannerWrap:  { marginHorizontal: STRIP_H, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  stripBannerImage: { width: '100%', height: 185 },

  hScrollContent:   { paddingHorizontal: 16, gap: 12 },
  bannerWrap:       { marginHorizontal: 16, borderRadius: 8, overflow: 'hidden', elevation: 0 },
  bannerImage:      { width: '100%', height: 120 },
  footerBannerWrap: { marginHorizontal: 0, borderRadius: 8, overflow: 'hidden' },
  footerBannerImage:{ width: '100%', height: 180 },
});