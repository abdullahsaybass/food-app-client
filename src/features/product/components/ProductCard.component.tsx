import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useProductStore } from '../store/product.store';
import {
  formatPrice,
  getVariantDiscountedPrice,
  getCheapestVariant,
} from '../utils/product.utils';

import type { Product } from '../types/product.types';
import { FontFamily, FontSize } from '../../../theme/typography';
const { width } = Dimensions.get('window');

const CARD_WIDTH  = Math.floor((width - 48) / 3);
const HCARD_WIDTH = (width - 40) / 2.45;

const IconZap = ({ size = 10, color = '#FF6B35' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} />
  </Svg>
);

interface Props {
  product: Product;
  onPress: (product: Product) => void;
  style?: object;
}

export const ProductCard: React.FC<Props> = ({ product, onPress, style }) => {
  const addToCart = useProductStore(s => s.addToCart);

  const displayVariant = getCheapestVariant(product) ?? product.variants[0];

  const discountedPrice = displayVariant
    ? getVariantDiscountedPrice(displayVariant, product.discountPercentage)
    : 0;

  const handleAdd = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!displayVariant) return;
      addToCart(product, displayVariant);
    },
    [product, displayVariant, addToCart],
  );

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.92}
    >
      {product.discountPercentage > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
        </View>
      )}

      <View style={styles.imageBox}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.deliveryRow}>
          <IconZap size={10} color="#FF6B35" />
          <Text style={styles.deliveryText}>Fast Delivery</Text>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.price}>{formatPrice(discountedPrice)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface HProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCardHorizontal: React.FC<HProps> = ({ product, onPress }) => {
  const addToCart = useProductStore(s => s.addToCart);

  const displayVariant = getCheapestVariant(product) ?? product.variants[0];

  const discountedPrice = displayVariant
    ? getVariantDiscountedPrice(displayVariant, product.discountPercentage)
    : 0;

  const handleAdd = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!displayVariant) return;
      addToCart(product, displayVariant);
    },
    [product, displayVariant, addToCart],
  );

  return (
    <TouchableOpacity
      style={h.card}
      onPress={() => onPress(product)}
      activeOpacity={0.92}
    >
      {product.discountPercentage > 0 && (
        <View style={h.discountBadge}>
          <Text style={h.discountText}>-{product.discountPercentage}%</Text>
        </View>
      )}

      <View style={h.imageBox}>
        <Image
          source={{ uri: product.image }}
          style={h.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={h.info}>
        <Text style={h.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.deliveryRow}>
          <IconZap size={10} color="#FF6B35" />
          <Text style={styles.deliveryText}>Fast Delivery</Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={h.priceInline}>
            <Text style={h.price}>{formatPrice(discountedPrice)}</Text>
          </View>

          <TouchableOpacity
            style={h.addBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
            disabled={!product.inStock}
          >
            <Text style={h.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Grid card styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  discountBadge: {
    position: 'absolute', top: 6, left: 6, zIndex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  discountText:  { fontSize: 9, fontWeight: '800', color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 90,
    backgroundColor: '#F8F8F8',
    alignItems: 'center', justifyContent: 'center',
    padding: 6,
  },
  productImage: { width: '100%', height: '100%' },

  info: { padding: 6, gap: 2 },

  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', lineHeight: 17, fontFamily: FontFamily.bold },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  deliveryText:  { fontSize: 9, fontWeight: '600', color: '#FF6B35', fontFamily: FontFamily.semiBold },

  bottomSection: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  price:{ fontSize: 11, fontWeight: '800', color: '#1a1a1a', fontFamily: FontFamily.extraBold },
  originalPrice: { fontSize: 9, color: '#BDBDBD', textDecorationLine: 'line-through', fontFamily: FontFamily.regular },

  addBtn: {
    width: 24, height: 24,
    borderRadius: 6,
    borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText:{ fontSize: 17, fontWeight: '400', color: '#1a1a1a', lineHeight: 22, marginTop: -1, fontFamily: FontFamily.regular },
});

// ── Horizontal card styles ────────────────────────────────────────────────────
const h = StyleSheet.create({
  card: {
    width: HCARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  discountBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { fontSize: 9, fontWeight: '800', color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 120,
    backgroundColor: '#F8F8F8',
    alignItems: 'center', justifyContent: 'center',
    padding: 8,
  },
  productImage: { width: '100%', height: '100%' },

  info: { padding: 10, gap: 3 },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 20,
    fontFamily: FontFamily.bold,
  },

  priceInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, flexShrink: 1,
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: FontFamily.extraBold,
  },
  originalPrice: {
    fontSize: 10,
    color: '#BDBDBD',
    textDecorationLine: 'line-through',
    fontFamily: FontFamily.regular,
  },

  addBtn: {
    width: 30, height: 30,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 20, fontWeight: '400',
    color: '#1a1a1a', lineHeight: 24, marginTop: -1,
    fontFamily: FontFamily.regular,
  },
});