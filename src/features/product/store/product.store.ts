/**
 * product.store.ts
 * Zustand store — all cart mutations hit the real backend.
 * Optimistic updates keep the UI snappy; errors roll back.
 */

import { create } from 'zustand';
import type { CartItem, Product } from '../types/product.types';
import { cartService, type CartResponse } from '../services/cart.service';

// ─── helpers ─────────────────────────────────────────────────────────────────
function deriveCountAndTotal(items: CartItem[]) {
  return {
    cartCount: items.reduce((s, i) => s + i.quantity, 0),
    cartTotal: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
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

// ─── store shape ──────────────────────────────────────────────────────────────
interface ProductStore {
  cartItems:   CartItem[];
  cartCount:   number;
  cartTotal:   number;
  cartLoading: boolean;
  cartError:   string | null;

  /** Load cart from the backend (call on app start / login). */
  fetchCart: () => Promise<void>;

  /**
   * Sync a guest cart after login.
   * Pass the local items collected while the user was unauthenticated.
   */
  syncGuestCart: (guestItems: CartItem[]) => Promise<void>;

  /** Optimistically add to cart, then confirm with backend. */
  addToCart: (product: Product, quantity?: number) => Promise<void>;

  /** Optimistically update quantity, then confirm with backend. */
  updateQuantity: (productId: string, quantity: number) => Promise<void>;

  /** Optimistically remove item, then confirm with backend. */
  removeFromCart: (productId: string) => Promise<void>;

  /** Clear entire cart (no optimistic — destructive action). */
  clearCart: () => Promise<void>;
}

// ─── store ────────────────────────────────────────────────────────────────────
export const useProductStore = create<ProductStore>((set, get) => ({
  cartItems:   [],
  cartCount:   0,
  cartTotal:   0,
  cartLoading: false,
  cartError:   null,

  // ── fetchCart ──────────────────────────────────────────────────────────────
  fetchCart: async () => {
    set({ cartLoading: true, cartError: null });
    try {
      const res = await cartService.getCart();
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Failed to load cart' });
    }
  },

  // ── syncGuestCart ──────────────────────────────────────────────────────────
  syncGuestCart: async (guestItems) => {
    if (guestItems.length === 0) { await get().fetchCart(); return; }
    set({ cartLoading: true, cartError: null });
    try {
      const payload = guestItems.map(i => ({
        productId: i.product.id,
        quantity:  i.quantity,
      }));
      const res = await cartService.syncCart(payload);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Cart sync failed' });
    }
  },

  // ── addToCart ──────────────────────────────────────────────────────────────
  addToCart: async (product, quantity = 1) => {
    // Optimistic update
    const prev = get().cartItems;
    const existing = prev.find(i => i.product.id === product.id);
    const optimistic: CartItem[] = existing
      ? prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i)
      : [...prev, { product, quantity }];

    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    try {
      const res = await cartService.addItem(product.id, quantity);
      set(applyServerCart(res));
    } catch (err: any) {
      // Roll back
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── updateQuantity ─────────────────────────────────────────────────────────
  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) { await get().removeFromCart(productId); return; }

    const prev = get().cartItems;
    const optimistic = prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    try {
      const res = await cartService.updateItem(productId, quantity);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── removeFromCart ─────────────────────────────────────────────────────────
  removeFromCart: async (productId) => {
    const prev = get().cartItems;
    const optimistic = prev.filter(i => i.product.id !== productId);
    set({ cartItems: optimistic, ...deriveCountAndTotal(optimistic) });

    try {
      const res = await cartService.removeItem(productId);
      set(applyServerCart(res));
    } catch (err: any) {
      set({ cartItems: prev, ...deriveCountAndTotal(prev), cartError: err.message });
    }
  },

  // ── clearCart ──────────────────────────────────────────────────────────────
  clearCart: async () => {
    set({ cartLoading: true, cartError: null });
    try {
      await cartService.clearCart();
      set({ cartItems: [], cartCount: 0, cartTotal: 0, cartLoading: false });
    } catch (err: any) {
      set({ cartLoading: false, cartError: err.message ?? 'Failed to clear cart' });
    }
  },
}));
