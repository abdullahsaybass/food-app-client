/**
 * Categories.screen.tsx
 * Fetches categories from backend. Tapping one navigates to CategoryProducts screen.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors } from '../../../theme';
import { BannerCarousel } from '../components/Banner.component';
import { productService } from '../services/product.service';
import { useProductStore } from '../store/product.store';
import type { Category } from '../types/product.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
    <Path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const IconHeart = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const IconCart = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6h18" stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10a4 4 0 01-8 0" stroke="#1a1a1a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTag = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
      stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={7} cy={7} r={1} fill={Colors.primary} />
  </Svg>
);

const IconChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Fallback bg colours cycling per card ────────────────────────────────────
const CARD_BACKGROUNDS = [
  '#E3F2FD', '#F3E5F5', '#FFF8E1', '#FFF3E0',
  '#E8F5E9', '#FCE4EC', '#F9FBE7', '#E0F7FA',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState('');

  const cartItems = useProductStore(s => s.cartItems);
  const cartQty   = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Fetch categories from backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService.getCategories()
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(err  => { if (!cancelled) setError(err.message ?? 'Failed to load categories'); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Filter out "All" and apply search
  const displayCategories = categories
    .filter(c => c.id !== 'all')
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCategoryPress = (cat: Category) => {
    navigation.navigate('CategoryProducts', {
      categoryId:   cat.id,
      categoryName: cat.name,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <IconHeart />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Cart' })}
          >
            <IconCart />
            {cartQty > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartQty > 99 ? '99+' : cartQty}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <IconSearch />
            <TextInput
              placeholder="Search categories..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* ── Banner ── */}
        {!search.trim() && (
          <View style={styles.bannerSection}>
            <BannerCarousel />
          </View>
        )}

        {/* ── Grid ── */}
        <View style={styles.section}>
          {!search.trim() && (
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : error ? (
            <View style={styles.centerMsg}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {displayCategories.map((cat, idx) => {
                const bg = CARD_BACKGROUNDS[idx % CARD_BACKGROUNDS.length];
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(cat)}
                  >
                    <View style={[styles.imageBox, { backgroundColor: bg }]}>
                      {cat.image ? (
                        <Image
                          source={{ uri: cat.image }}
                          style={styles.catImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.fallbackEmoji}>🛒</Text>
                      )}
                    </View>
                    <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}

              {!loading && displayCategories.length === 0 && (
                <View style={styles.centerMsg}>
                  <Text style={styles.errorText}>No categories found</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── Exclusive Offers ── */}
        {!search.trim() && (
          <TouchableOpacity style={styles.offersBanner} activeOpacity={0.85}>
            <View style={styles.offersLeft}>
              <View style={styles.offersIconWrap}>
                <IconTag />
              </View>
              <View>
                <Text style={styles.offersTitle}>Exclusive Offers</Text>
                <Text style={styles.offersSubtitle}>Check out our best deals &amp; combos</Text>
              </View>
            </View>
            <IconChevronRight />
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   '#fff',
  },
  headerTitle: {
    flex:       1,
    fontSize:   20,
    fontWeight: '800',
    color:      '#1a1a1a',
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: '#F5F5F5',
    alignItems:      'center',
    justifyContent:  'center',
  },
  badge: {
    position:          'absolute',
    top:               2,
    right:             2,
    minWidth:          16,
    height:            16,
    borderRadius:      8,
    backgroundColor:   Colors.primary,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  searchRow: { paddingHorizontal: 16, marginBottom: 4 },
  searchBar: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    backgroundColor:   '#F5F5F5',
    borderRadius:      12,
    paddingHorizontal: 16,
    height:            48,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },

  bannerSection: { marginTop: 16 },

  scrollContent: { paddingTop: 8 },
  section:       { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },

  // 3-column grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    width:         '30.5%',
    borderRadius:  16,
    borderWidth:   1,
    borderColor:   '#F0F0F0',
    padding:       12,
    alignItems:    'center',
    backgroundColor: '#fff',
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius:  4,
    elevation:     2,
  },
  imageBox: {
    width:          '100%',
    aspectRatio:    1,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   10,
    overflow:       'hidden',
  },
  catImage:      { width: '80%', height: '80%' },
  fallbackEmoji: { fontSize: 30 },
  catName:       { fontSize: 12, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', lineHeight: 16 },

  centerMsg:  { flex: 1, alignItems: 'center', paddingVertical: 40 },
  errorText:  { color: '#9CA3AF', fontSize: 14 },

  offersBanner: {
    marginHorizontal:  16,
    marginTop:         20,
    borderRadius:      16,
    backgroundColor:   '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical:   16,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  offersLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  offersIconWrap: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#DCFCE7',
    alignItems:      'center',
    justifyContent:  'center',
  },
  offersTitle:    { fontSize: 14, fontWeight: '700', color: Colors.primary },
  offersSubtitle: { fontSize: 12, color: '#555', marginTop: 2 },
});