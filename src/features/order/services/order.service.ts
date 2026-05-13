/**
 * order.service.ts
 * Wraps all /api/orders endpoints.
 *
 * Backend routes consumed:
 *   POST   /api/orders              → placeOrder
 *   GET    /api/orders              → getOrderHistory  (paginated)
 *   GET    /api/orders/:id          → getOrderById
 *   PATCH  /api/orders/:id/cancel   → cancelOrder
 *   PATCH  /api/orders/:id/status   → updateStatus     (admin only)
 */

import { API } from '../../../app/lib/api';
import type {
  Order,
  OrderItem,
  OrderListResult,
  OrderPagination,
  PlaceOrderPayload,
} from '../types/order.types';

// ─── Backend raw shapes ───────────────────────────────────────────────────────

type BackendProductImage = string | { url?: string; publicId?: string } | null | undefined;

interface BackendOrderProduct {
  _id?:   string;
  id?:    string;
  name:   string;
  image?: BackendProductImage;
  price:  number;
  unit?:  string;
}

interface BackendOrderItem {
  product:  BackendOrderProduct;
  quantity: number;
  price:    number;
}

interface BackendAddress {
  fullName?:   string;
  phone?:      string;
  street?:     string;
  city?:       string;
  state?:      string;
  postalCode?: string;
  label?:      string;
}

interface BackendOrder {
  _id:    string;
  id?:    string;
  status: string;
  items:  BackendOrderItem[];

  // ── amount fields — backend may send any of these ─────────────────────────
  subtotal?:    number;
  shippingFee?: number;
  shipping?:    number;
  discount?:    number;
  total?:       number;      // some responses
  totalAmount?: number;      // ✅ your backend actually sends this
  totalPrice?:  number;      // fallback

  // ── address — backend uses shippingAddress; deliveryAddress kept as fallback
  shippingAddress?:  BackendAddress;
  deliveryAddress?:  BackendAddress;

  promoCode?: string;
  createdAt:  string;
  updatedAt:  string;
}

interface BackendPagination {
  total?:       number;
  totalOrders?: number;
  page?:        number;
  limit?:       number;
  totalPages?:  number;
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

/**
 * Safely extracts an image URI string from whatever the backend sends.
 *   - plain string       → returns it
 *   - { url, publicId }  → extracts .url
 *   - null / undefined   → null
 */
const extractImageUri = (image: BackendProductImage): string | null => {
  if (!image) return null;
  if (typeof image === 'string') return image || null;
  const obj = image as { url?: string; publicId?: string };
  return obj.url ?? null;
};

const toOrderItem = (raw: BackendOrderItem): OrderItem => ({
  product: {
    id:    raw.product._id ?? raw.product.id ?? '',
    name:  raw.product.name,
    image: extractImageUri(raw.product.image),
    price: raw.product.price,
    unit:  raw.product.unit ?? 'pcs',
  },
  quantity: raw.quantity,
  price:    raw.price,
});

const toOrder = (raw: BackendOrder): Order => {
  // ── Resolve total — try every field the backend might send ────────────────
  const resolvedTotal =
    raw.totalAmount ??   // ✅ your backend sends this
    raw.total       ??
    raw.totalPrice  ??
    0;

  // ── Resolve address — backend uses shippingAddress ────────────────────────
  const addr: BackendAddress =
    raw.shippingAddress ??   // ✅ what your backend actually sends
    raw.deliveryAddress ??
    {};

  return {
    id:          raw._id ?? raw.id ?? '',
    status:      raw.status as Order['status'],
    items:       (raw.items ?? []).map(toOrderItem),
    subtotal:    raw.subtotal             ?? 0,
    shippingFee: raw.shippingFee ?? raw.shipping ?? 0,
    discount:    raw.discount             ?? 0,
    totalAmount: resolvedTotal,
    total:       resolvedTotal,
    deliveryAddress: {
      fullName:   addr.fullName   ?? '',
      phone:      addr.phone      ?? '',
      street:     addr.street     ?? '',
      city:       addr.city       ?? '',
      state:      addr.state,
      postalCode: addr.postalCode,
    },
    promoCode: raw.promoCode,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const toPagination = (
  raw: BackendPagination,
  page: number,
  limit: number,
): OrderPagination => ({
  total:      raw.total ?? raw.totalOrders ?? 0,
  page:       raw.page  ?? page,
  limit:      raw.limit ?? limit,
  totalPages: raw.totalPages ?? 1,
});

// ─── List params ──────────────────────────────────────────────────────────────

export interface OrderHistoryParams {
  page?:   number;
  limit?:  number;
  status?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const orderService = {

  /** POST /api/orders — place a new order from the user's current cart. */
placeOrder: async (payload: PlaceOrderPayload): Promise<Order> => {
  console.log('🛒 PLACE ORDER PAYLOAD:', JSON.stringify(payload, null, 2));
  try {
    const { data } = await API.post('/orders', payload);
    return toOrder(data?.data ?? data);
  } catch (e: any) {
    console.log('❌ ORDER ERROR:', JSON.stringify(e.response?.data, null, 2));
    throw e;
  }
},

  /** GET /api/orders — paginated order history for the logged-in user. */
  getOrderHistory: async (params: OrderHistoryParams = {}): Promise<OrderListResult> => {
    const page  = params.page  ?? 1;
    const limit = params.limit ?? 10;

    const query: Record<string, any> = { page, limit };
    if (params.status) query.status = params.status;

    const { data } = await API.get('/orders', { params: query });
    const raw = data?.data ?? data;

    const orders: BackendOrder[] = raw.orders ?? raw.data ?? [];
    const pagination = toPagination(raw.pagination ?? raw, page, limit);

    return { orders: orders.map(toOrder), pagination };
  },

  /** GET /api/orders/:id — fetch a single order into activeOrder. */
  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await API.get(`/orders/${orderId}`);
    return toOrder(data?.data ?? data);
  },

  /** PATCH /api/orders/:id/cancel — cancel a pending order. */
  cancelOrder: async (orderId: string): Promise<Order> => {
    const { data } = await API.patch(`/orders/${orderId}/cancel`, {});
    return toOrder(data?.data ?? data);
  },
};