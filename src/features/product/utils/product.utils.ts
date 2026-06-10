// product/utils/product.utils.ts

import type { ProductVariant } from '../types/product.types';
import type { Banner } from '../types/product.types';

// ── Price formatting ───────────────────────────────────────────────────────
export const formatPrice = (price: number) => {
  return `MVR ${price.toFixed(2)}`;
};
// ── Variant discounted price ───────────────────────────────────────────────
export function getVariantDiscountedPrice(
  variant: ProductVariant,
  discountPercentage: number,
): number {
  if (!discountPercentage) return variant.price;
  return Math.round(variant.price * (1 - discountPercentage / 100) * 100) / 100;
}

// ── Cheapest variant (for list card display) ───────────────────────────────
export function getCheapestVariant(product: {
  variants?: ProductVariant[];
}): ProductVariant | undefined {
  const variants = product.variants ?? [];
  if (!variants.length) return undefined;
  return [...variants].sort((a, b) => a.price - b.price)[0];
}

// ── Static banners — no offers/discounts, brand messaging only ─────────────
export const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Fresh Frozen Meat',
    subtitle: 'Premium quality delivered to your door',
    tagline: 'Farm to Freezer',
    backgroundColor: '#1B4332',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  },
  {
    id: '2',
    title: 'Seafood Special',
    subtitle: 'Straight from the ocean to your table',
    tagline: 'Fresh Daily',
    backgroundColor: '#1E3A5F',
    image: 'https://images.unsplash.com/photo-1563804447971-6e113ab80713?w=600&q=80',
  },
  {
    id: '3',
    title: 'Dairy & Cheese',
    subtitle: 'Farm fresh every morning',
    tagline: 'Pure & Natural',
    backgroundColor: '#1a1a1a',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80',
  },
];
