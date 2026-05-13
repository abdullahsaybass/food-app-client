/**
 * order.store.ts
 * Zustand store — all order mutations hit the real backend.
 * Mirrors the same patterns used in product.store.ts.
 */

import { create } from 'zustand';
import { orderService, type OrderHistoryParams } from '../services/order.service';
import type { Order, OrderListResult, PlaceOrderPayload } from '../types/order.types';

// ─── Store shape ──────────────────────────────────────────────────────────────

interface OrderStore {
  // ── State ──────────────────────────────────────────────────────────────────
  orders:     Order[];
  pagination: OrderListResult['pagination'] | null;
  activeOrder: Order | null;       // detail view / just-placed order

  isPlacing:  boolean;             // POST /orders in-flight
  isFetching: boolean;             // GET /orders in-flight
  isFetchingOne: boolean;          // GET /orders/:id in-flight
  isCancelling: boolean;           // PATCH /orders/:id/cancel in-flight

  placeError:  string | null;
  fetchError:  string | null;
  cancelError: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** POST /api/orders — place a new order. Returns the created Order. */
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order | null>;

  /** GET /api/orders — load (or refresh) order history. */
  fetchOrderHistory: (params?: OrderHistoryParams) => Promise<void>;

  /** GET /api/orders/:id — load a single order into activeOrder. */
  fetchOrderById: (orderId: string) => Promise<void>;

  /** PATCH /api/orders/:id/cancel — cancel an order and refresh it in state. */
  cancelOrder: (orderId: string) => Promise<boolean>;

  /** Clear activeOrder (e.g. on screen unmount). */
  clearActiveOrder: () => void;

  /** Reset all errors. */
  clearErrors: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders:        [],
  pagination:    null,
  activeOrder:   null,

  isPlacing:     false,
  isFetching:    false,
  isFetchingOne: false,
  isCancelling:  false,

  placeError:  null,
  fetchError:  null,
  cancelError: null,

  // ── placeOrder ─────────────────────────────────────────────────────────────
  placeOrder: async (payload) => {
    set({ isPlacing: true, placeError: null });
    try {
      const order = await orderService.placeOrder(payload);
      // Prepend to local list so history is immediately up-to-date
      set(s => ({
        isPlacing:   false,
        activeOrder: order,
        orders:      [order, ...s.orders],
      }));
      return order;
    } catch (err: any) {
      set({ isPlacing: false, placeError: err.message ?? 'Failed to place order.' });
      return null;
    }
  },

  // ── fetchOrderHistory ──────────────────────────────────────────────────────
  fetchOrderHistory: async (params = {}) => {
    set({ isFetching: true, fetchError: null });
    try {
      const result = await orderService.getOrderHistory(params);
      const isFirstPage = !params.page || params.page === 1;
      set(s => ({
        isFetching: false,
        pagination:  result.pagination,
        // Replace list on first page, append on subsequent pages (infinite scroll)
        orders: isFirstPage ? result.orders : [...s.orders, ...result.orders],
      }));
    } catch (err: any) {
      set({ isFetching: false, fetchError: err.message ?? 'Failed to load orders.' });
    }
  },

  // ── fetchOrderById ─────────────────────────────────────────────────────────
  fetchOrderById: async (orderId) => {
    set({ isFetchingOne: true, fetchError: null });
    try {
      const order = await orderService.getOrderById(orderId);
      set({ isFetchingOne: false, activeOrder: order });
    } catch (err: any) {
      set({ isFetchingOne: false, fetchError: err.message ?? 'Failed to load order.' });
    }
  },

  // ── cancelOrder ────────────────────────────────────────────────────────────
  cancelOrder: async (orderId) => {
    set({ isCancelling: true, cancelError: null });
    try {
      const updated = await orderService.cancelOrder(orderId);
      set(s => ({
        isCancelling: false,
        // Update in list
        orders: s.orders.map(o => o.id === orderId ? updated : o),
        // Update detail view if open
        activeOrder: s.activeOrder?.id === orderId ? updated : s.activeOrder,
      }));
      return true;
    } catch (err: any) {
      set({ isCancelling: false, cancelError: err.message ?? 'Failed to cancel order.' });
      return false;
    }
  },

  // ── clearActiveOrder ───────────────────────────────────────────────────────
  clearActiveOrder: () => set({ activeOrder: null }),

  // ── clearErrors ────────────────────────────────────────────────────────────
  clearErrors: () => set({ placeError: null, fetchError: null, cancelError: null }),
}));