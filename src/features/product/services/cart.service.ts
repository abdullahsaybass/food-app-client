// product/services/cart.service.ts

import { API } from '../../../app/lib/api';
import type { CartItem, Product, ProductVariant } from '../types/product.types';

export interface CartResponse {
  items: CartItem[];
  count: number;
  total: number;
}

// ── Mappers ───────────────────────────────────────────────────────────────────
const toVariant = (raw: any): ProductVariant => ({
  unit:             raw.unit             ?? 'pcs',
  price:            raw.price            ?? 0,
  quantity:         raw.quantity         ?? 0,
  sku:              raw.sku              ?? '',
  minOrderQuantity: raw.minOrderQuantity ?? 1,
  bulkPrice:        raw.bulkPrice        ?? 0,
  stockThreshold:   raw.stockThreshold   ?? 10,
  // ✅ variant detail fields
  weight:           raw.weight           ?? 0,
  weightUnit:       raw.weightUnit       ?? 'kg',
  piecesCount:      raw.piecesCount      ?? 0,
  packetQuantity:   raw.packetQuantity   ?? 0,
  caseQuantity:     raw.caseQuantity     ?? 0,
  manufactureDate:  raw.manufactureDate  ?? undefined,
  expiryDate:       raw.expiryDate       ?? undefined,
});

const toProduct = (raw: any): Product => ({
  id:                 raw._id ?? raw.id    ?? '',
  name:               raw.name             ?? '',
  slug:               raw.slug             ?? '',
  description:        raw.description      ?? '',
  category:           raw.category?.toLowerCase()?.trim() ?? '',
  categoryId:         raw.category?.toLowerCase()?.trim() ?? '',
  tags:               raw.tags             ?? [],
  variants:           (raw.variants ?? []).map(toVariant),
  images:             raw.images           ?? [],
  image:              raw.images?.[0]?.url ?? raw.image ?? '',
  featured:           raw.featured         ?? false,
  isActive:           raw.isActive         ?? true,
  isDeleted:          raw.isDeleted        ?? false,
  discountPercentage: raw.discountPercentage ?? 0,
  totalStock:         raw.totalStock       ?? 0,
  inStock:            raw.inStock          ?? true,
  lowStockVariants:   [],
  createdBy:          raw.createdBy        ?? '',
  updatedBy:          raw.updatedBy        ?? '',
  createdAt:          raw.createdAt        ?? '',
  updatedAt:          raw.updatedAt        ?? '',
  // ✅ product info fields
  shortDescription:   raw.shortDescription ?? '',
  brand:              raw.brand            ?? '',
  quality:            raw.quality          ?? '',
  countryOrigin:      raw.countryOrigin    ?? '',
  storageInstruction: raw.storageInstruction ?? '',
  usageInstruction:   raw.usageInstruction ?? '',
  // ✅ product flags
  halal:              raw.halal            ?? false,
  frozen:             raw.frozen           ?? false,
  fresh:              raw.fresh            ?? false,
  bestSeller:         raw.bestSeller       ?? false,
  newArrival:         raw.newArrival       ?? false,
  // ✅ analytics
  rating:             raw.rating           ?? 0,
  reviewCount:        raw.totalReviews     ?? raw.reviewCount ?? 0,
  totalReviews:       raw.totalReviews     ?? 0,
  totalSold:          raw.totalSold        ?? 0,
  totalViews:         raw.totalViews       ?? 0,
});

// FIX: Backend cart mapper only returns { id, name, image, category } for product.
// Build selectedVariant directly from cart item fields (unit, price, inStock).
const toCartItem = (raw: any): CartItem => {
  const product = toProduct(raw.product);

  const selectedVariant: ProductVariant = {
    unit:             raw.unit  ?? 'pcs',
    price:            raw.price ?? 0,
    quantity:         raw.inStock ? 1 : 0,
    sku:              raw.sku   ?? '',
    minOrderQuantity: 1,
    bulkPrice:        0,
    stockThreshold:   10,
    weight:           0,
    weightUnit:       'kg',
    piecesCount:      0,
    packetQuantity:   0,
    caseQuantity:     0,
    manufactureDate:  undefined,
    expiryDate:       undefined,
  };

  return { product, selectedVariant, quantity: raw.quantity };
};

const toCartResponse = (data: any): CartResponse => ({
  items: (data.items ?? []).map(toCartItem),
  count: data.totalItems ?? 0,
  total: data.totalPrice ?? 0,
});

// ── Service ───────────────────────────────────────────────────────────────────
export const cartService = {

  getCart: async (): Promise<CartResponse> => {
    const { data } = await API.get('/cart');
    return toCartResponse(data.data);
  },

  syncCart: async (
    items: { productId: string; unit: string; quantity: number }[],
  ): Promise<CartResponse> => {
    const { data } = await API.post('/cart/sync', { items });
    return toCartResponse(data.data);
  },

  addItem: async (
    productId: string,
    unit: string,
    quantity = 1,
  ): Promise<CartResponse> => {
    const { data } = await API.post('/cart/items', { productId, unit, quantity });
    return toCartResponse(data.data);
  },

  updateItem: async (
    productId: string,
    unit: string,
    quantity: number,
  ): Promise<CartResponse> => {
    const { data } = await API.patch(`/cart/items/${productId}/${unit}`, { quantity });
    return toCartResponse(data.data);
  },

  removeItem: async (
    productId: string,
    unit: string,
  ): Promise<CartResponse> => {
    const { data } = await API.delete(`/cart/items/${productId}/${unit}`);
    return toCartResponse(data.data);
  },

  clearCart: async (): Promise<void> => {
    await API.delete('/cart');
  },
};