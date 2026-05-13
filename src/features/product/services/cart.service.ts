// product/services/cart.service.ts

import { API } from '../../../app/lib/api';
import type { CartItem, Product } from '../types/product.types';

export interface CartResponse {
  items: CartItem[];
  count: number;
  total: number;
}

const toProduct = (raw: any): Product => ({
  id:          raw.id,
  name:        raw.name,
  description: '',
  price:       raw.price,
  unit:        raw.unit     ?? 'pcs',
  image:       raw.image    ?? '',
  category:    raw.category ?? '',
  categoryId:  raw.category ?? '',
  rating:      4.5,
  reviewCount: 0,
  inStock:     raw.inStock  ?? true,
  seller:      '',
  vendor:      '',
});

const toCartItem = (raw: any): CartItem => ({
  product:  toProduct(raw.product),
  quantity: raw.quantity,
});

const toCartResponse = (data: any): CartResponse => ({
  items: (data.items ?? []).map(toCartItem),
  count: data.totalItems ?? 0,
  total: data.totalPrice ?? 0,
});

export const cartService = {

  getCart: async (): Promise<CartResponse> => {
    const { data } = await API.get('/cart');
    return toCartResponse(data.data);
  },

  syncCart: async (
    items: { productId: string; quantity: number }[]
  ): Promise<CartResponse> => {
    const { data } = await API.post('/cart/sync', { items });
    return toCartResponse(data.data);
  },

  addItem: async (productId: string, quantity = 1): Promise<CartResponse> => {
    const { data } = await API.post('/cart/items', { productId, quantity });
    return toCartResponse(data.data);
  },

  updateItem: async (productId: string, quantity: number): Promise<CartResponse> => {
    const { data } = await API.patch(`/cart/items/${productId}`, { quantity });
    return toCartResponse(data.data);
  },

  removeItem: async (productId: string): Promise<CartResponse> => {
    const { data } = await API.delete(`/cart/items/${productId}`);
    return toCartResponse(data.data);
  },

  clearCart: async (): Promise<void> => {
    await API.delete('/cart');
  },
};