/**
 * order.service.ts
 *
 * Aligned with backend order.mapper.js output:
 *  - shippingAddress (not deliveryAddress)
 *  - zip (not postalCode)
 *  - statusTimeline[].at (not timestamp)
 *  - statusTimeline (not statusHistory)
 *  - orderNumber, statusLabel, paymentStatus, estimatedDeliveryAt, cancelledBy, cancelReason
 */

import { API } from '../../../app/lib/api';
import type {
  Order,
  OrderItem,
  OrderListResult,
  OrderPagination,
  PlaceOrderPayload,
  StatusTimelineEntry,
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
  name?:    string;
  unit:     string;
  quantity: number;
  price:    number;
  subtotal: number;
}

interface BackendTimelineEntry {
  status:      string;
  statusLabel: string;
  note:        string | null;
  at:          string;
}

interface BackendShippingAddress {
  label?:         string;
  fullName?:      string;
  phone?:         string;
  street?:        string;
  city?:          string;
  state?:         string;
  zip?:           string;
  country?:       string;
  location?: { latitude: number | null; longitude: number | null };
  locationLabel?: string;
}

interface BackendOrder {
  _id:                  string;
  id?:                  string;
  orderNumber?:         string;
  status:               string;
  statusLabel?:         string;
  paymentMethod?:       string;
  paymentStatus?:       string;
  items:                BackendOrderItem[];
  itemsTotal?:          number;
  deliveryCharge?:      number;
  couponCode?:          string | null;
  discountAmount?:      number;
  subtotal?:            number;   // legacy fallback
  shippingFee?:         number;   // legacy fallback
  discount?:            number;   // legacy fallback
  totalAmount?:         number;
  shippingAddress?:     BackendShippingAddress;
  statusTimeline?:      BackendTimelineEntry[];
  estimatedDeliveryAt?: string | null;
  cancelledBy?:         string | null;
  cancelReason?:        string | null;
  createdAt:            string;
  updatedAt:            string;
}

interface BackendPagination {
  total?:       number;
  totalOrders?: number;
  page?:        number;
  limit?:       number;
  totalPages?:  number;
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

const extractImageUri = (image: BackendProductImage): string | null => {
  if (!image) return null;
  if (typeof image === 'string') return image || null;
  return (image as { url?: string }).url ?? null;
};

const toOrderItem = (raw: BackendOrderItem): OrderItem => ({
  product: {
    id:    raw.product?._id ?? raw.product?.id ?? '',
    name:  raw.product?.name ?? raw.name ?? '',
    image: extractImageUri(raw.product?.image),
    price: raw.product?.price ?? raw.price,
    unit:  raw.unit,
  },
  unit:     raw.unit,
  quantity: raw.quantity,
  price:    raw.price,
  subtotal: raw.subtotal ?? raw.price * raw.quantity,
});

const toTimelineEntry = (raw: BackendTimelineEntry): StatusTimelineEntry => ({
  status:      raw.status,
  statusLabel: raw.statusLabel ?? raw.status,
  note:        raw.note ?? null,
  at:          raw.at,             // field is "at", not "timestamp"
});

const toOrder = (raw: BackendOrder): Order => {
  const addr = raw.shippingAddress ?? {};
  return {
    id:                  raw._id ?? raw.id ?? '',
    orderNumber:         raw.orderNumber ?? '',
    status:              raw.status as Order['status'],
    statusLabel:         raw.statusLabel ?? raw.status,
    paymentMethod:       raw.paymentMethod ?? 'cod',
    paymentStatus:       raw.paymentStatus ?? 'pending',
    items:               (raw.items ?? []).map(toOrderItem),
    itemsTotal:          raw.itemsTotal ?? raw.subtotal ?? 0,
    deliveryCharge:      raw.deliveryCharge ?? raw.shippingFee ?? 0,
    couponCode:          raw.couponCode ?? null,
    discountAmount:      raw.discountAmount ?? raw.discount ?? 0,
    // legacy aliases kept for backward compat
    subtotal:            raw.itemsTotal ?? raw.subtotal ?? raw.totalAmount ?? 0,
    shippingFee:         raw.deliveryCharge ?? raw.shippingFee ?? 0,
    discount:            raw.discountAmount ?? raw.discount ?? 0,
    totalAmount:         raw.totalAmount ?? 0,
    shippingAddress: {   // field is "shippingAddress", NOT "deliveryAddress"
      fullName:      addr.fullName      ?? '',
      phone:         addr.phone         ?? '',
      street:        addr.street        ?? '',
      city:          addr.city          ?? '',
      state:         addr.state         ?? '',
      zip:           addr.zip           ?? '',   // "zip", NOT "postalCode"
      country:       addr.country       ?? 'Maldives',
      label:         addr.label,
      location:      addr.location,
      locationLabel: addr.locationLabel,
    },
    statusTimeline:      (raw.statusTimeline ?? []).map(toTimelineEntry),
    estimatedDeliveryAt: raw.estimatedDeliveryAt ?? null,
    cancelledBy:         (raw.cancelledBy ?? null) as Order['cancelledBy'],
    cancelReason:        raw.cancelReason ?? null,
    createdAt:           raw.createdAt,
    updatedAt:           raw.updatedAt,
  };
};

const toPagination = (raw: BackendPagination, page: number, limit: number): OrderPagination => ({
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

  placeOrder: async (payload: PlaceOrderPayload): Promise<Order> => {
    try {
      const { data } = await API.post('/orders', payload);
      return toOrder(data?.data ?? data);
    } catch (e: any) {
      throw new Error(
        e.response?.data?.message ??
        e.response?.data?.errors?.[0] ??
        e.message ??
        'Failed to place order'
      );
    }
  },

  getOrderHistory: async (params: OrderHistoryParams = {}): Promise<OrderListResult> => {
    const page  = params.page  ?? 1;
    const limit = params.limit ?? 10;
    const query: Record<string, any> = { page, limit };
    if (params.status) query.status = params.status;

    const { data } = await API.get('/orders', { params: query });
    const raw = data?.data ?? data;
    const orders: BackendOrder[] = raw.orders ?? raw.data ?? [];
    return {
      orders:     orders.map(toOrder),
      pagination: toPagination(raw.pagination ?? raw, page, limit),
    };
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await API.get(`/orders/${orderId}`);
    return toOrder(data?.data ?? data);
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const { data } = await API.patch(`/orders/${orderId}/cancel`, {});
    return toOrder(data?.data ?? data);
  },
};