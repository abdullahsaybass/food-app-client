import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../../theme';
import { ProductCard, ProductCardHorizontal } from '../components/ProductCard.component';
import { BannerCarousel } from '../components/Banner.component';
import { CategoryList, STATIC_CATEGORIES } from '../components/CategoryList.component';
import { useAuthStore } from '../../auth/store/auth.store';
import { useProductStore } from '../store/product.store';
import { productService } from '../services/product.service';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';
import type { Product } from '../types/product.types';
import banner1      from '@/assets/images/daily.png';
import banner2      from '@/assets/images/delivery.png';
import dalbanner    from '@/assets/images/dalbanner.png';
import freezebanner from '@/assets/images/freshbanner.png';
import seedbanner   from '@/assets/images/seedbanner.png';
import nutsbanner   from '@/assets/images/nutsbanner.png';
import { FontFamily, FontSize } from '../../../theme/typography';
import Homefooter from '../components/Home.footer';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

const PRIMARY = '#2E7D32';

const CATEGORY_BANNERS: Record<string, any> = {
  dal:    dalbanner,
  frozen: freezebanner,
  seeds:  seedbanner,
  nuts:   nutsbanner,
  powder: nutsbanner,
};

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

interface StripProps {
  categoryId: string;
  title:      string;
  banner:     any;
  onPress:    (p: Product) => void;
}
const CategoryStrip: React.FC<StripProps> = ({ categoryId, title, banner, onPress }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading,  setLoading]  = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService.listProducts({ limit: 20 })
      .then(res => {
        if (cancelled) return;
        setProducts(res.data.filter(
          p => p.category?.toLowerCase()?.trim() === categoryId.toLowerCase()
        ));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All  →</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity activeOpacity={0.9} style={styles.stripBannerWrap}>
        <Image source={banner} style={styles.stripBannerImage} resizeMode="cover" />
      </TouchableOpacity>
      {loading
        ? <ActivityIndicator color={PRIMARY} style={{ marginLeft: 20 }} />
        : <View style={styles.grid}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} onPress={onPress} />
            ))}
          </View>
      }
    </View>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch]                     = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [popularProducts,  setPopularProducts]  = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [popularLoading,   setPopularLoading]   = useState(false);
  const [categoryLoading,  setCategoryLoading]  = useState(false);
  const [popularError,     setPopularError]     = useState<string | null>(null);
  const [categoryError,    setCategoryError]    = useState<string | null>(null);

  const user      = useAuthStore(s => s.user);
  const cartItems = useProductStore(s => s.cartItems);
  const fetchCart = useProductStore(s => s.fetchCart);
  const cartQty   = cartItems.length;

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    let cancelled = false;
    setPopularLoading(true);
    setPopularError(null);
    productService.listProducts({ popular: true, limit: 8 })
      .then(res => { if (!cancelled) setPopularProducts(res.data); })
      .catch(err => { if (!cancelled) setPopularError(err.message); })
      .finally(() => { if (!cancelled) setPopularLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCategoryLoading(true);
    setCategoryError(null);
    productService.listProducts({ limit: 100 })
      .then(res => {
        if (cancelled) return;
        const filtered = selectedCategory === 'all'
          ? res.data
          : res.data.filter(p =>
              p.category?.toLowerCase()?.trim() === selectedCategory?.toLowerCase()?.trim()
            );
        setCategoryProducts(filtered);
      })
      .catch(err => { if (!cancelled) setCategoryError(err.message); })
      .finally(() => { if (!cancelled) setCategoryLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory]);

  useEffect(() => {
    const pool = selectedCategory === 'all' ? popularProducts : categoryProducts;
    if (!search.trim()) { setFilteredProducts(pool); return; }
    setFilteredProducts(pool.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, popularProducts, categoryProducts, selectedCategory]);

  const handleProductPress = useCallback(
    (product: Product) => navigation.navigate('ProductDetail', { productId: product.id }),
    [navigation],
  );

  const renderGrid = (products: Product[], loading: boolean, error: string | null) => {
    if (loading) return (
      <View style={styles.centeredMsg}>
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
    if (error || !products.length) return (
      <View style={styles.centeredMsg}>
        <Text style={styles.emptyText}>{error ?? 'No products found'}</Text>
      </View>
    );
    return (
      <View style={styles.grid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onPress={handleProductPress} />
        ))}
      </View>
    );
  };

  const currentLabel = STATIC_CATEGORIES.find(c => c.id === selectedCategory)?.name ?? 'Products';

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
                  <Text style={styles.avatarInitial}>
                    {user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name ?? 'Guest'} 👋</Text>
              <Text style={styles.welcomeText}>Welcome back!</Text>
            </View>
          </View>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.iconBtn}>
              <IconBell color="#1a1a1a" size={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => (navigation as any).navigate('Cart')}
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
            <View style={styles.section}>
              <BannerCarousel />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All  →</Text>
                </TouchableOpacity>
              </View>
              <CategoryList selected={selectedCategory} onSelect={setSelectedCategory} />
            </View>

            <View style={[styles.section, { paddingBottom: 16 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{currentLabel}</Text>
              </View>
              {renderGrid(categoryProducts, categoryLoading, categoryError)}
            </View>

            <View style={styles.section}>
              <TouchableOpacity activeOpacity={0.9} style={styles.promoBannerWrap}>
                <Image source={banner2} style={styles.promoBannerImage} resizeMode="cover" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best Selling</Text>
              </View>
              {popularLoading
                ? <ActivityIndicator color={PRIMARY} style={{ marginLeft: 20 }} />
                : popularError
                  ? <View style={styles.centeredMsg}>
                      <Text style={styles.emptyText}>{popularError}</Text>
                    </View>
                  : <View style={styles.grid}>
                      {popularProducts.map(p => (
                        <ProductCard key={p.id} product={p} onPress={handleProductPress} />
                      ))}
                    </View>
              }
            </View>

            {STATIC_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <CategoryStrip
                key={cat.id}
                categoryId={cat.id}
                title={cat.name}
                banner={CATEGORY_BANNERS[cat.id]}
                onPress={handleProductPress}
              />
            ))}
          </>
        )}

        {/* <View style={[styles.section, { marginBottom: 8 }]}>
          <TouchableOpacity activeOpacity={0.9} style={styles.footerBannerWrap}>
            <Image source={banner1} style={styles.footerBannerImage} resizeMode="cover" />
          </TouchableOpacity>
        </View> */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 8 },

  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  userRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap:     { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: '#eee' },
  avatarImg:      { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: FontFamily.bold },
  greeting:       { fontSize: 13, color: '#888', fontFamily: FontFamily.regular },
  welcomeText:    { fontSize: 19, fontWeight: '800', color: '#1a1a1a', fontFamily: FontFamily.bold },

  iconGroup: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText:      { fontSize: 9, fontWeight: '800', color: '#fff', fontFamily: FontFamily.bold },

  searchRow: { paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16, height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', fontFamily: FontFamily.regular },

  deliverRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  deliverLabel:    { fontSize: 13, color: '#555', marginLeft: 6, fontFamily: FontFamily.regular },
  deliverLocation: { fontSize: 13, fontWeight: '700', color: PRIMARY, fontFamily: FontFamily.bold },
  changeBtn:       { fontSize: 13, fontWeight: '600', color: PRIMARY, fontFamily: FontFamily.bold },

  section:       { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: '#1a1a1a', fontFamily: FontFamily.bold },
  viewAll:       { fontSize: 13, fontWeight: '600', color: PRIMARY, fontFamily: FontFamily.bold },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    columnGap: 8,
    rowGap: 8,
  },

  hScrollContent: { paddingHorizontal: 20, gap: 12 },

  bannerWrap:  { marginHorizontal: 20, borderRadius: 8, overflow: 'hidden', elevation: 0 },
  bannerImage: { width: '100%', height: 120 },

  centeredMsg: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center' },
  emptyText:   { color: '#7A7A7A', textAlign: 'center', fontSize: 14, fontFamily: FontFamily.regular },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, fontFamily: FontFamily.bold },

  promoBannerWrap:  { alignSelf: 'center', width: '100%', borderRadius: 8, overflow: 'hidden' },
  promoBannerImage: { width: '100%', height: 200 },

  stripBannerWrap:  { marginHorizontal: 16, marginBottom: 14, borderRadius: 8, overflow: 'hidden' },
  stripBannerImage: { width: '100%', height: 230 },

  footerBannerWrap:  { marginHorizontal: 0, borderRadius: 8, overflow: 'hidden' },
  footerBannerImage: { width: '100%', height: 180 },
});