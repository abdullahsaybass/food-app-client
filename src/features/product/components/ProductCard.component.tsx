import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Colors, Typography, Radius } from '../../../theme';
import { useProductStore } from '../store/product.store';
import { formatPrice, getDiscountedPrice } from '../utils/product.utils';
import type { Product } from '../types/product.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

interface Props {
  product: Product;
  onPress: (product: Product) => void;
  style?: object;
}

export const ProductCard: React.FC<Props> = ({ product, onPress, style }) => {
  const addToCart = useProductStore(s => s.addToCart);
  const cartItems = useProductStore(s => s.cartItems);
  const cartItem  = cartItems.find(i => i.product.id === product.id);

  const discountedPrice = getDiscountedPrice(product.price, product.discount);

  const handleAdd = useCallback((e: any) => {
    e.stopPropagation();
    addToCart(product);
  }, [product, addToCart]);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.92}
    >
      {product.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{product.discount}% OFF</Text>
        </View>
      ) : null}

      {/* Real product image */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>{product.description}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviewCount})</Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{formatPrice(discountedPrice)}</Text>
            {product.discount ? (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            ) : null}
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, cartItem && styles.addBtnActive]}
            onPress={handleAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>
              {cartItem ? `+${cartItem.quantity}` : '+'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8, left: 8, zIndex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },

  imageBox: {
    height: 120,
    backgroundColor: Colors.grey100,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },

  info: { padding: 10 },
  name: { ...Typography.titleMedium, color: Colors.textPrimary, marginBottom: 2 },
  desc: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 6 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  star:    { fontSize: 11, color: '#F59E0B' },
  rating:  { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '700' },
  reviews: { ...Typography.bodySmall, color: Colors.textSecondary },

  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price:         { ...Typography.titleMedium, color: Colors.textPrimary, fontWeight: '700' },
  originalPrice: { ...Typography.bodySmall, color: Colors.textDisabled, textDecorationLine: 'line-through' },
  unit:          { ...Typography.bodySmall, color: Colors.textSecondary },

  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnActive: { backgroundColor: Colors.primary },
  addBtnText: { color: Colors.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
});