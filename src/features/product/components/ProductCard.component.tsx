import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert,
} from 'react-native';

import { useProductStore } from '../store/product.store';
import {
  formatPrice, getVariantDiscountedPrice, getCheapestVariant,
} from '../utils/product.utils';
import type { Product } from '../types/product.types';
import { FontFamily } from '../../../theme/typography';

const { width } = Dimensions.get('window');
const GRID_H_PADDING = 16;
const GRID_GAP       = 8;
const GRID_COLUMNS   = 3;
const CARD_WIDTH  = (width - GRID_H_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
const HCARD_WIDTH = (width - 16 * 2 - 12) / 2.45;

function useCartActions(product: Product) {
  const addToCart      = useProductStore(s => s.addToCart);
  const updateQuantity = useProductStore(s => s.updateQuantity);
  const removeFromCart = useProductStore(s => s.removeFromCart);
  const cartItems      = useProductStore(s => s.cartItems);

  const displayVariant  = getCheapestVariant(product) ?? product.variants[0];
  const discountedPrice = displayVariant
    ? getVariantDiscountedPrice(displayVariant, product.discountPercentage)
    : 0;

  const cartItem = cartItems.find(
    i => i.product.id === product.id && i.selectedVariant.unit === displayVariant?.unit,
  );
  const quantity = cartItem?.quantity ?? 0;
  const inCart   = quantity > 0;

  const handleAdd = useCallback((e: any) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (displayVariant.quantity <= 0) {
      Alert.alert('Out of stock', 'This item is currently unavailable.');
      return;
    }
    addToCart(product, displayVariant);
  }, [product, displayVariant, addToCart]);

  const handleIncrease = useCallback((e: any) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (quantity >= displayVariant.quantity) {
      Alert.alert('Stock limit reached', `Only ${displayVariant.quantity} left in stock.`);
      return;
    }
    updateQuantity(product.id, displayVariant.unit, quantity + 1);
  }, [product, displayVariant, quantity, updateQuantity]);

  const handleDecrease = useCallback((e: any) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (quantity <= 1) removeFromCart(product.id, displayVariant.unit);
    else updateQuantity(product.id, displayVariant.unit, quantity - 1);
  }, [product, displayVariant, quantity, updateQuantity, removeFromCart]);

  return { displayVariant, discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease };
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
interface Props {
  product: Product;
  onPress: (product: Product) => void;
  style?: object;
}

export const ProductCard: React.FC<Props> = ({ product, onPress, style }) => {
  const { displayVariant, discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease } =
    useCartActions(product);

  return (
    <TouchableOpacity style={[s.card, style]} onPress={() => onPress(product)} activeOpacity={0.92}>
      {displayVariant?.unit ? (
        <View style={s.discountBadge}>
          <Text style={s.discountText}>{displayVariant.unit}</Text>
        </View>
      ) : null}

      <View style={s.imageBox}>
        <Image source={{ uri: product.image }} style={s.productImage} resizeMode="cover" />
      </View>

      <View style={s.info}>
        <Text style={s.name} numberOfLines={1} ellipsizeMode="tail">{product.name}</Text>
        <Text style={s.price} numberOfLines={1}>{formatPrice(discountedPrice)}</Text>
      </View>

      <View style={s.actionZone}>
        {inCart ? (
          <View style={s.stepper}>
            <TouchableOpacity style={s.minusBtn} onPress={handleDecrease} activeOpacity={0.7}>
              <Text style={s.minusText}>−</Text>
            </TouchableOpacity>
            <Text style={s.stepCount}>{quantity}</Text>
            <TouchableOpacity style={s.plusBtn} onPress={handleIncrease} activeOpacity={0.7}>
              <Text style={s.plusText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.addBtn} onPress={handleAdd} activeOpacity={0.7} disabled={!product.inStock}>
            <Text style={s.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Horizontal Card ───────────────────────────────────────────────────────────
interface HProps {
  product: Product;
  onPress: (product: Product) => void;
  style?:  object;
}

export const ProductCardHorizontal: React.FC<HProps> = ({ product, onPress, style }) => {
  const { displayVariant, discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease } =
    useCartActions(product);

  return (
    <TouchableOpacity style={[h.card, style]} onPress={() => onPress(product)} activeOpacity={0.92}>
      {displayVariant?.unit ? (
        <View style={h.discountBadge}>
          <Text style={h.discountText}>{displayVariant.unit}</Text>
        </View>
      ) : null}

      <View style={h.imageBox}>
        <Image source={{ uri: product.image }} style={h.productImage} resizeMode="cover" />
      </View>

      <View style={h.info}>
        <Text style={h.name} numberOfLines={1} ellipsizeMode="tail">{product.name}</Text>
        <Text style={h.price} numberOfLines={1}>{formatPrice(discountedPrice)}</Text>
      </View>

      <View style={h.actionZone}>
        {inCart ? (
          <View style={h.stepper}>
            <TouchableOpacity style={h.minusBtn} onPress={handleDecrease} activeOpacity={0.7}>
              <Text style={h.minusText}>−</Text>
            </TouchableOpacity>
            <Text style={h.stepCount}>{quantity}</Text>
            <TouchableOpacity style={h.plusBtn} onPress={handleIncrease} activeOpacity={0.7}>
              <Text style={h.plusText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={h.addBtn} onPress={handleAdd} activeOpacity={0.7} disabled={!product.inStock}>
            <Text style={h.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Grid card styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  discountBadge: {
    position: 'absolute', top: 6, left: 6, zIndex: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  discountText: { fontSize: 9, color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 90,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },

  info: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 2,
  },

  name: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 20,
    height: 20,
    width: '100%',
    fontFamily: FontFamily.bold,
  },
  price: {
    fontSize: 11,
    color: '#1a1a1a',
    lineHeight: 14,
    height: 14,
    fontFamily: FontFamily.extraBold,
  },

  actionZone: {
    height: 44,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },

  addBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: FontFamily.bold,
    lineHeight: 22,
  },

  stepper: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    height: 28,
    backgroundColor: '#fff',
  },
  minusBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  minusText: {
    fontSize: 16,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    lineHeight: 20,
  },
  stepCount: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 28,
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    backgroundColor: '#fff',
  },
  plusBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  plusText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: FontFamily.bold,
    lineHeight: 20,
  },
});

// ── Horizontal card styles ────────────────────────────────────────────────────
const h = StyleSheet.create({
  card: {
    width: HCARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  discountBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { fontSize: 9, color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 120,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },

  info: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 4,
    overflow: 'hidden',
  },

  name: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 19,
    height: 19,
    width: '100%',
    fontFamily: FontFamily.bold,
  },
  price: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 16,
    height: 16,
    fontFamily: FontFamily.extraBold,
  },

  actionZone: {
    height: 50,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  addBtn: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: FontFamily.bold,
    lineHeight: 24,
  },

  stepper: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    height: 34,
    backgroundColor: '#fff',
  },
  minusBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  minusText: {
    fontSize: 18,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    lineHeight: 22,
  },
  stepCount: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 34,
    fontSize: 13,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    backgroundColor: '#fff',
  },
  plusBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  plusText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: FontFamily.bold,
    lineHeight: 22,
  },
});