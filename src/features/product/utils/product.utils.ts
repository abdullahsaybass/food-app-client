/**
 * product.utils.ts
 * Static UI data + pure helper functions.
 * MOCK_PRODUCTS removed — data now comes from the API via productService.
 */

import type { Category, Banner } from '../types/product.types';

// ─── Static UI data ───────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: 'all',        name: 'All',          color: '#FF6B35', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  { id: 'coffee-tea', name: 'Coffee & Tea', color: '#6F4E37', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' },
  { id: 'fruits',     name: 'Fruits',       color: '#E91E8C', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80' },
  { id: 'fastfood',   name: 'Fast food',    color: '#FF9800', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
  { id: 'vegetables', name: 'Vegetables',   color: '#4CAF50', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80' },
  { id: 'meat',       name: 'Meat',         color: '#F44336', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80' },
  { id: 'dairy',      name: 'Dairy',        color: '#FFC107', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&q=80' },
];

export const BANNERS: Banner[] = [
  {
    id: '1',
    title: '35% Discount',
    subtitle: '100% Guaranteed all\nFresh Grocery Items',
    discount: '35%',
    backgroundColor: '#F0F7EE',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
  },
  {
    id: '2',
    title: 'Free Delivery',
    subtitle: 'On orders above\n$50 — Today only!',
    discount: 'FREE',
    backgroundColor: '#FFF3EE',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
  },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────
export const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

export const getDiscountedPrice = (price: number, discount?: number): number =>
  discount ? price - (price * discount) / 100 : price;
