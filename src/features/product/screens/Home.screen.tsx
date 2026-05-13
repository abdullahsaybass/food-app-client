// product/screens/Home.screen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Radius } from '../../../theme';
import { ProductCard } from '../components/ProductCard.component';
import { BannerCarousel } from '../components/Banner.component';
import { CategoryList } from '../components/CategoryList.component';
import { useAuthStore } from '../../auth/store/auth.store';
import { useProductStore } from '../store/product.store';
import { BANNERS } from '../utils/product.utils';
import { productService } from '../services/product.service';
import type { ProductStackParamList } from '../../../app/navigation/navigation.types';
import type { Product, Category } from '../types/product.types';

type Props = NativeStackScreenProps<ProductStackParamList, 'HomeScreen'>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBell = ({ color = '#1a1a1a', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const IconSearch = ({ color = '#9CA3AF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={2} />
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconFilter = ({ color = '#1a1a1a', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ── Categories from backend ────────────────────────────────────────────────
  const [categories,        setCategories]        = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Products ───────────────────────────────────────────────────────────────
  const [popularProducts,  setPopularProducts]  = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [popularLoading,   setPopularLoading]   = useState(false);
  const [categoryLoading,  setCategoryLoading]  = useState(false);
  const [popularError,     setPopularError]     = useState<string | null>(null);
  const [categoryError,    setCategoryError]    = useState<string | null>(null);

  const user      = useAuthStore(s => s.user);
  const fetchCart = useProductStore(s => s.fetchCart);

  useEffect(() => { fetchCart(); }, []);

  // ── Fetch categories from backend ──────────────────────────────────────────
  useEffect(() => {
    setCategoriesLoading(true);
    productService.getCategories()
      .then(cats => setCategories(cats))
      .catch(() => {
        // Fallback to a minimal "All" option so the screen isn't broken
        setCategories([{ id: 'all', name: 'All', color: '#FF6B35', image: '' }]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ── Popular products ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setPopularLoading(true);
    setPopularError(null);

    productService.listProducts({ popular: true, limit: 6 })
      .then(res => { if (!cancelled) setPopularProducts(res.data); })
      .catch(err => { if (!cancelled) setPopularError(err.message); })
      .finally(() => { if (!cancelled) setPopularLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Category products (re-runs on selectedCategory change) ────────────────
  useEffect(() => {
    let cancelled = false;
    setCategoryLoading(true);
    setCategoryError(null);

    const params = selectedCategory === 'all'
      ? { limit: 10 }
      : { categoryId: selectedCategory, limit: 10 };

    productService.listProducts(params)
      .then(res => { if (!cancelled) setCategoryProducts(res.data); })
      .catch(err => { if (!cancelled) setCategoryError(err.message); })
      .finally(() => { if (!cancelled) setCategoryLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCategory]);

  const handleProductPress = useCallback(
    (product: Product) => navigation.navigate('ProductDetail', { productId: product.id }),
    [navigation],
  );

  // ── Grid renderer ──────────────────────────────────────────────────────────
  const renderGrid = (
    products: Product[],
    loading: boolean,
    error: string | null,
    isCategory = false,
  ) => {
    if (loading) {
      return <View style={styles.centeredMsg}><ActivityIndicator color={Colors.primary} /></View>;
    }
    // For category sections: treat any error as "no products" (most likely cause
    // is an empty category, not a real server fault). For popular, show the error.
    if (error) {
      if (isCategory) {
        return (
          <View style={styles.centeredMsg}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        );
      }
      return <View style={styles.centeredMsg}><Text style={styles.errorText}>{error}</Text></View>;
    }
    if (!products.length) {
      return (
        <View style={styles.centeredMsg}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={handleProductPress}
            style={idx % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }}
          />
        ))}
      </View>
    );
  };

  // ── Current category name for section header ───────────────────────────────
  const currentCategoryName =
    categories.find(c => c.id === selectedCategory)?.name ?? 'Products';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.userRow}>
            <View style={styles.avatarWrap}>
              {user?.profilePic?.url ? (
                <Image source={{ uri: user.profilePic.url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
                </View>
              )}
            </View>
            <View style={styles.userTextWrap}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name ?? 'Guest'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <IconBell color="#1a1a1a" size={22} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.9}>
            <IconSearch color="#9CA3AF" size={18} />
            <Text style={styles.searchPlaceholder}>Search for food...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <IconFilter color="#1a1a1a" size={18} />
          </TouchableOpacity>
        </View>

        {/* Banners */}
        <View style={styles.section}>
          <BannerCarousel banners={BANNERS} />
        </View>

        {/* Categories — from backend */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          {categoriesLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginLeft: 20 }} />
          ) : (
            <CategoryList
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
        </View>

        {/* Popular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular</Text>
          </View>
          {renderGrid(popularProducts, popularLoading, popularError, false)}
        </View>

        {/* Category products */}
        <View style={[styles.section, { paddingBottom: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{currentCategoryName}</Text>
          </View>
          {renderGrid(categoryProducts, categoryLoading, categoryError, true)}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 8 },

  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  userRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userTextWrap: { gap: 2 },
  avatarWrap:   { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: '#eee' },
  avatarImg:    { width: '100%', height: '100%' },
  avatarFallback: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { ...Typography.titleMedium, color: '#fff' },
  greeting:       { fontSize: 12, color: '#888', fontWeight: '400' },
  userName:       { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  bellBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10, marginTop: 8, marginBottom: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F5F5', borderRadius: Radius.full, paddingHorizontal: 16, height: 48 },
  searchPlaceholder: { ...Typography.bodyMedium, color: '#9CA3AF', flex: 1 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },

  section:       { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, rowGap: 12 },

  centeredMsg: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
  errorText:   { ...Typography.bodyMedium, color: Colors.error, textAlign: 'center' },
  emptyText:   { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
});
