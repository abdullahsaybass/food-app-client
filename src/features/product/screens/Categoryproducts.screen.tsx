/**
 * CategoryProducts.screen.tsx
 * Shows products filtered by category. Receives categoryId + categoryName as route params.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontFamily } from '../../../theme';
import { ProductCard } from '../components/ProductCard.component';
import { productService } from '../services/product.service';
import type { Product } from '../types/product.types';
import type { RootStackParamList } from '../../../app/navigation/navigation.types';

const { width } = Dimensions.get('window');

// 3 columns: 16px padding each side + 8px gap between 3 columns (2 gaps)
const NUM_COLUMNS    = 3;
const H_PADDING      = 16;
const COL_GAP        = 8;
const CARD_WIDTH     = (width - H_PADDING * 2 - COL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBack = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryProducts'>;

// ─── Component ────────────────────────────────────────────────────────────────

export const CategoryProductsScreen: React.FC<Props> = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService.listProducts({ categoryId, limit: 100 })
      .then(res => { if (!cancelled) setProducts(res.data); })
      .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load products'); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [categoryId]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  // Pass explicit width so ProductCard renders at correct 3-col size
  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      style={{ width: CARD_WIDTH }}
    />
  ), [handleProductPress]);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.centerMsg}>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>Nothing in {categoryName} yet.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <IconBack />
        </TouchableOpacity>
        {/* ✅ larger, bolder title using FontFamily */}
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Cart' })}
        >
          <IconCart />
        </TouchableOpacity>
      </View>

      {/* ── Loading ── */}
      {loading ? (
        <View style={styles.centerMsg}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerMsg}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={NUM_COLUMNS}         // ✅ 3 columns
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // ✅ bigger title: 22px extraBold via FontFamily token
  headerTitle: {
    flex:             1,
    fontSize:         22,
    fontFamily:       FontFamily.extraBold,
    color:            '#1a1a1a',
    marginHorizontal: 12,
    textAlign:        'center',   // ✅ centered between the two icon buttons
  },

  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: '#F5F5F5',
    alignItems:      'center',
    justifyContent:  'center',
  },

  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop:        12,
    paddingBottom:     120,
  },

  // ✅ gap matches COL_GAP constant; marginBottom gives row spacing
  row: {
    gap:          COL_GAP,
    marginBottom: COL_GAP,
  },

  resultCount: {
    fontSize:     13,
    fontFamily:   FontFamily.regular,
    color:        '#9CA3AF',
    marginBottom: 12,
  },

  centerMsg: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 60,
  },
  emptyTitle:    { fontSize: 16, fontFamily: FontFamily.bold,    color: '#1a1a1a', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, fontFamily: FontFamily.regular, color: '#9CA3AF', textAlign: 'center' },
});