/**
 * product.store.ts
 * - Logged in: all mutations hit the backend (same as before)
 * - Guest: mutations stay local (optimistic only, no API call)
 *   Guest cart is persisted to AsyncStorage so it survives restarts.
 *   On login, call syncGuestCart() to push items to the backend.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CartItem, Product, ProductVariant } from '../types/product.types';
import { cartService, type CartResponse } from '../services/cart.service';
import { getVariantDiscountedPrice } from '../utils/product.utils';
import { useAuthStore } from '../../auth/store/auth.store';

const GUEST_CART_KEY = 'guest_cart';

// ─── helpers ──────────────────────────────────────────────────────────────────
function deriveCountAndTotal(items: CartItem[]) {
  return {
    cartCount: items.reduce((s, i) => s + i.quantity, 0),
    cartTotal: items.reduce(
      (s, i) => s + getVariantDiscountedPrice(i.selectedVariant, i.product.discountPercentage ?? 0) * i.quantity,
      0
    ),
  };
}

function applyServerCart(res: CartResponse): Partial<ProductStore> {
  return {
    cartItems:   res.items,
    cartCount:   res.count,
    cartTotal:   res.total,
    cartLoading: false,
    cartError:   null,
  };
}

const lineKey = (productId: string, unit: string) => `${productId}::${unit}`;
// Cap at whatever stock the variant actually has — was hardcoded to 99,
// which let people add more than was in stock.
const maxQty  = (variant: ProductVariant) => { const q = variant.quantity ?? 0; return q > 0 ? q : 99; };

const isLoggedIn = () => !!useAuthStore.getState().token;

// Persist guest cart to AsyncStorage (fire-and-forget)
const saveGuestCart = (items: CartItem[]) => {
  AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)).catch(() => {});
};

export const loadGuestCart = async (): Promise<CartItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearGuestCart = () => {
  AsyncStorage.removeItem(GUEST_CART_KEY).catch(() => {});
};

// ─── store shape ──────────────────────────────────────────────────────────────
interface ProductStore {
  cartItems:   CartItem[];
  cartCount:   number;
  cartTotal:   number;
  cartLoading: boolean;
  cartError:   string | null;

  fetchCart:      () => Promise<void>;
  syncGuestCart:  (guestItems: CartItem[]) => Promise<void>;
  addToCart:      (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, unit: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, unit: string) => Promise<void>;
  clearCart:      () => Promise<void>;
  hydrateGuestCart: () => Promise<void>;
}

// ─── store ────────────────────────────────────────────────────────────────────
export const useProductStore = create<ProductStore>((set, get) => ({

  cartItems:   [],
  cartCount:   0,
  cartTotal:   0,
  cartLoading: false,
  cartError:   null,

  // Load guest cart from AsyncStorage on app start (call from Splash or App.tsx)
  hydrateGuestCart: async () => {
    if (isLoggedIn()) return; // logged-in cart comes from server
    const items = await loadGuestCart();
    if (items.length > 0) {
      set({ cartItems: items, ...deriveCountAndTotal(items) });
    }
  },

  // ── fetchCart ────────────────────────────────────────────────────────────
  fetchCart: async () => {
    if (!isLoggedIn()) return; // guest cart lives locally, no API call
    set({ cartLoading: true, cartError: null });
    try {
      const res = await cartService.getCart();
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Failed to load cart' });
    }
  },

  // ── syncGuestCart ────────────────────────────────────────────────────────
  syncGuestCart: async (guestItems) => {
    if (guestItems.length === 0) {
      await get().fetchCart();
      return;
    }
    set({ cartLoading: true, cartError: null });
    try {
      const payload = guestItems.map((i) => ({
        productId: i.product.id,
        unit:      i.selectedVariant.unit,
        quantity:  i.quantity,
      }));
      const res = await cartService.syncCart(payload);
      clearGuestCart();
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Cart sync failed' });
    }
  },

  // ── addToCart ────────────────────────────────────────────────────────────
  addToCart: async (product, variant, quantity = 1) => {
    const prev = get().cartItems;
    const key  = lineKey(product.id, variant.unit);

    const optimistic: CartItem[] = prev.some(
      (i) => lineKey(i.product.id, i.selectedVariant.unit) === key
    )
      ? prev.map((i) =>
          lineKey(i.product.id, i.selectedVariant.unit) === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty(i.selectedVariant)) }
            : i
        )
      : [...prev, { product, selectedVariant: variant, quantity: Math.min(quantity, maxQty(variant)) }];

    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    if (!isLoggedIn()) {
      saveGuestCart(optimistic); // persist locally, no API call
      return;
    }

    try {
      const res = await cartService.addItem(product.id, variant.unit, quantity);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── updateQuantity ───────────────────────────────────────────────────────
  updateQuantity: async (productId, unit, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(productId, unit);
      return;
    }

    const prev = get().cartItems;
    const key  = lineKey(productId, unit);
    const item = prev.find((i) => lineKey(i.product.id, i.selectedVariant.unit) === key);
    if (!item) return;

    const safeQuantity = Math.min(quantity, maxQty(item.selectedVariant));
    const optimistic   = prev.map((i) =>
      lineKey(i.product.id, i.selectedVariant.unit) === key ? { ...i, quantity: safeQuantity } : i
    );

    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    if (!isLoggedIn()) {
      saveGuestCart(optimistic);
      return;
    }

    try {
      const res = await cartService.updateItem(productId, unit, safeQuantity);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── removeFromCart ───────────────────────────────────────────────────────
  removeFromCart: async (productId, unit) => {
    const prev       = get().cartItems;
    const key        = lineKey(productId, unit);
    const optimistic = prev.filter((i) => lineKey(i.product.id, i.selectedVariant.unit) !== key);

    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    if (!isLoggedIn()) {
      saveGuestCart(optimistic);
      return;
    }

    try {
      const res = await cartService.removeItem(productId, unit);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── clearCart ────────────────────────────────────────────────────────────
  clearCart: async () => {
    set({ cartLoading: true, cartError: null });
    if (!isLoggedIn()) {
      clearGuestCart();
      set({ cartItems: [], cartCount: 0, cartTotal: 0, cartLoading: false });
      return;
    }
    try {
      await cartService.clearCart();
      set({ cartItems: [], cartCount: 0, cartTotal: 0, cartLoading: false });
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Failed to clear cart' });
    }
  },

}));