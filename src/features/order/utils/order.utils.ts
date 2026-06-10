/**
 * order.utils.ts
 * Pure helper functions for the order module.
 * Mirrors the pattern in product.utils.ts — no side effects, no imports from store.
 */

import type { OrderStatus } from '../types/order.types';

// ─── Status display ───────────────────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    '#FF9800',
  confirmed:  '#2196F3',
  processing: '#9C27B0',
  shipped:    '#03A9F4',
  delivered:  '#4CAF50',
  cancelled:  '#F44336',
};

export const ORDER_STATUS_BG: Record<OrderStatus, string> = {
  pending:    '#FFF3E0',
  confirmed:  '#E3F2FD',
  processing: '#F3E5F5',
  shipped:    '#E1F5FE',
  delivered:  '#E8F5E9',
  cancelled:  '#FFEBEE',
};

export const ORDER_STATUS_EMOJI: Record<OrderStatus, string> = {
  pending:    '🕐',
  confirmed:  '✅',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '📦',
  cancelled:  '❌',
};

/** Human-readable status badge props */
export const getStatusBadge = (status: OrderStatus) => ({
  label: ORDER_STATUS_LABEL[status],
  color: ORDER_STATUS_COLOR[status],
  bg:    ORDER_STATUS_BG[status],
  emoji: ORDER_STATUS_EMOJI[status],
});

// ─── Price helpers ────────────────────────────────────────────────────────────

export const formatOrderPrice = (amount?: number) =>
  `MVR ${Number(amount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Cancellable statuses ─────────────────────────────────────────────────────

export const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'confirmed'];

export const isCancellable = (status: OrderStatus): boolean =>
  CANCELLABLE_STATUSES.includes(status);

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const formatOrderDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

export const formatOrderTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// ─── Short order ID ───────────────────────────────────────────────────────────

/** Shows last 6 chars of the MongoDB _id, uppercased — e.g. "A1B2C3" */
export const shortOrderId = (id: string): string =>
  id.slice(-6).toUpperCase();