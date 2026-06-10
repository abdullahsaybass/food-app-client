/**
 * order.store.ts
 */

import { create } from 'zustand';
import { orderService, type OrderHistoryParams } from '../services/order.service';
import { couponApi } from '../services/Coupon.api';
import type { Order, OrderListResult, PlaceOrderPayload, SavedAddress } from '../types/order.types';

interface OrderStore {
  // ── State ──────────────────────────────────────────────────────────────────
  orders:        Order[];
  pagination:    OrderListResult['pagination'] | null;
  activeOrder:   Order | null;

  isPlacing:     boolean;
  isFetching:    boolean;
  isFetchingOne: boolean;
  isCancelling:  boolean;

  placeError:  string | null;
  fetchError:  string | null;
  cancelError: string | null;

  /** Coupon */
  couponCode:    string | null;
  couponDiscount: number;          // absolute ₹/$ amount off
  couponError:   string | null;
  isApplyingCoupon: boolean;

  /** Address chosen in SelectAddressScreen — passed back to CheckoutScreen */
  pendingAddress: SavedAddress | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  applyCoupon:  (code: string, cartTotal: number) => Promise<void>;
  removeCoupon: () => void;
  placeOrder:        (payload: PlaceOrderPayload) => Promise<Order | null>;
  fetchOrderHistory: (params?: OrderHistoryParams) => Promise<void>;
  fetchOrderById:    (orderId: string) => Promise<void>;
  cancelOrder:       (orderId: string) => Promise<boolean>;
  clearActiveOrder:  () => void;
  clearErrors:       () => void;
  setPendingAddress: (address: SavedAddress | null) => void;
}

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

  couponCode:       null,
  couponDiscount:   0,
  couponError:      null,
  isApplyingCoupon: false,

  pendingAddress: null,

  // ── applyCoupon ────────────────────────────────────────────────────────────
  applyCoupon: async (code, cartTotal) => {
    set({ isApplyingCoupon: true, couponError: null });
    try {
      const result = await couponApi.apply(code, cartTotal);
      set({
        isApplyingCoupon: false,
        couponCode:       code.toUpperCase(),
        couponDiscount:   result.discount,
        couponError:      null,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err.message ?? 'Invalid coupon code.';
      set({ isApplyingCoupon: false, couponError: msg, couponCode: null, couponDiscount: 0 });
    }
  },

  // ── removeCoupon ───────────────────────────────────────────────────────────
  removeCoupon: () => set({ couponCode: null, couponDiscount: 0, couponError: null }),

  // ── placeOrder ─────────────────────────────────────────────────────────────
  placeOrder: async (payload) => {
    set({ isPlacing: true, placeError: null });
    try {
      const order = await orderService.placeOrder(payload);
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
        orders:      s.orders.map(o => o.id === orderId ? updated : o),
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
  clearErrors: () => set({ placeError: null, fetchError: null, cancelError: null, couponError: null }),

  // ── setPendingAddress ──────────────────────────────────────────────────────
  setPendingAddress: (address) => set({ pendingAddress: address }),
}));