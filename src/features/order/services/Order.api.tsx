/**
 * order.api.ts
 *
 * All order-related API calls.
 * Extracted from user.api.ts where they didn't belong.
 *
 * Used by: features/order/services/order.service.ts
 */

import { API }          from '../../../app/lib/api';
import type { OrderStatus } from '../types/order.types';

// ─────────────────────────────────────────────
// 📦 ORDER HISTORY
// ─────────────────────────────────────────────

export const getOrderHistoryApi = async (params?: {
  page?:   number;
  limit?:  number;
  status?: OrderStatus;
}) => {
  const res = await API.get('/orders', {
    params: {
      page:  params?.page  ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.status ? { status: params.status } : {}),
    },
  });
  return res.data;
};

export const getOrderByIdApi = async (orderId: string) => {
  const res = await API.get(`/orders/${orderId}`);
  return res.data;
};

export const cancelOrderApi = async (orderId: string, reason?: string) => {
  const res = await API.patch(`/orders/${orderId}/cancel`, { reason });
  return res.data;
};

export const reorderApi = async (orderId: string) => {
  const res = await API.post(`/orders/${orderId}/reorder`);
  return res.data;
};