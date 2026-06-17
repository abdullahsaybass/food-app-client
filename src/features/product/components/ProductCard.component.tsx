import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Image,
} from 'react-native';

import { useProductStore } from '../store/product.store';
import {
  formatPrice, getVariantDiscountedPrice, getCheapestVariant,
} from '../utils/product.utils';
import type { Product } from '../types/product.types';
import { FontFamily } from '../../../theme/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH  = Math.floor((width - 48) / 3);
const HCARD_WIDTH = (width - 40) / 2.45;

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
    addToCart(product, displayVariant);
  }, [product, displayVariant, addToCart]);

  const handleIncrease = useCallback((e: any) => {
    e.stopPropagation();
    if (!displayVariant) return;
    updateQuantity(product.id, displayVariant.unit, quantity + 1);
  }, [product, displayVariant, quantity, updateQuantity]);

  const handleDecrease = useCallback((e: any) => {
    e.stopPropagation();
    if (!displayVariant) return;
    if (quantity <= 1) removeFromCart(product.id, displayVariant.unit);
    else updateQuantity(product.id, displayVariant.unit, quantity - 1);
  }, [product, displayVariant, quantity, updateQuantity, removeFromCart]);

  return { discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease };
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
interface Props {
  product: Product;
  onPress: (product: Product) => void;
  style?: object;
}

export const ProductCard: React.FC<Props> = ({ product, onPress, style }) => {
  const { discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease } =
    useCartActions(product);

  return (
    <TouchableOpacity style={[s.card, style]} onPress={() => onPress(product)} activeOpacity={0.92}>
      {product.discountPercentage > 0 && (
        <View style={s.discountBadge}>
          <Text style={s.discountText}>-{product.discountPercentage}%</Text>
        </View>
      )}

      <View style={s.imageBox}>
        <Image source={{ uri: product.image }} style={s.productImage} resizeMode="contain" />
      </View>

      <View style={s.info}>
        <Text style={s.name} numberOfLines={2}>{product.name}</Text>
        <Text style={s.price}>{formatPrice(discountedPrice)}</Text>
      </View>

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
          <Text style={s.addText}>Add</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ── Horizontal Card ───────────────────────────────────────────────────────────
interface HProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCardHorizontal: React.FC<HProps> = ({ product, onPress }) => {
  const { discountedPrice, quantity, inCart, handleAdd, handleIncrease, handleDecrease } =
    useCartActions(product);

  return (
    <TouchableOpacity style={h.card} onPress={() => onPress(product)} activeOpacity={0.92}>
      {product.discountPercentage > 0 && (
        <View style={h.discountBadge}>
          <Text style={h.discountText}>-{product.discountPercentage}%</Text>
        </View>
      )}

      <View style={h.imageBox}>
        <Image source={{ uri: product.image }} style={h.productImage} resizeMode="contain" />
      </View>

      <View style={h.info}>
        <Text style={h.name} numberOfLines={2}>{product.name}</Text>
        <Text style={h.price}>{formatPrice(discountedPrice)}</Text>
      </View>

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
          <Text style={h.addText}>Add</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ── Grid card styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  discountBadge: {
    position: 'absolute', top: 6, left: 6, zIndex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  discountText: { fontSize: 9, color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 90,
    backgroundColor: '#F8F8F8',
    alignItems: 'center', justifyContent: 'center',
    padding: 6,
  },
  productImage: { width: '100%', height: '100%' },

  info: { paddingHorizontal: 6, paddingTop: 8, paddingBottom: 4, gap: 2 },

  name: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
    fontFamily: FontFamily.bold,
  },
  price: {
    fontSize: 11,
    color: '#E53935',
    fontFamily: FontFamily.extraBold,
  },

  addBtn: {
    margin: 6,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addText: {
    fontSize: 11,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
  },

  stepper: {
    flexDirection: 'row',
    margin: 6,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    overflow: 'hidden',
    height: 28,
  },
  minusBtn: {
    flex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  minusText: {
    fontSize: 16,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    lineHeight: 20,
  },
  stepCount: {
    flex: 1,
    height: 28,
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
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  discountBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { fontSize: 9, color: '#fff', fontFamily: FontFamily.bold },

  imageBox: {
    height: 120,
    backgroundColor: '#F8F8F8',
    alignItems: 'center', justifyContent: 'center',
    padding: 8,
  },
  productImage: { width: '100%', height: '100%' },

  info: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 4, gap: 4 },

  name: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 19,
    fontFamily: FontFamily.bold,
  },
  price: {
    fontSize: 13,
    color: '#E53935',
    fontFamily: FontFamily.extraBold,
  },

  addBtn: {
    margin: 10,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addText: {
    fontSize: 13,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
  },

  stepper: {
    flexDirection: 'row',
    margin: 10,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    overflow: 'hidden',
    height: 34,
  },
  minusBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  minusText: {
    fontSize: 18,
    color: '#2E7D32',
    fontFamily: FontFamily.bold,
    lineHeight: 22,
  },
  stepCount: {
    flex: 1,
    height: 34,
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
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
  },
  plusText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: FontFamily.bold,
    lineHeight: 22,
  },
});