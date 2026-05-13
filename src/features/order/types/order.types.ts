/**
 * order.types.ts
 * All TypeScript interfaces for the order module.
 * Mirrors the product.types.ts convention — pure data shapes, no logic.
 */

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface DeliveryAddress {
  fullName:    string;
  phone:       string;
  street:      string;
  city:        string;
  state?:      string;
  postalCode?: string;
}

// ─── Order item ───────────────────────────────────────────────────────────────

export interface OrderProduct {
  id:    string;
  name:  string;
  image: string | null;  // ✅ FIX: was `any` — backend may return { url, publicId } object;
                         //    the service normaliser extracts .url into a plain string | null.
                         //    RN <Image source={{ uri: ... }}> requires a string, not an object.
  price: number;
  unit:  string;
}

export interface OrderItem {
  product:  OrderProduct;
  quantity: number;
  price:    number;       // unit price at time of order
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id:              string;
  status:          OrderStatus;
  items:           OrderItem[];

  subtotal:        number;
  shippingFee:     number;
  discount:        number;
  totalAmount:     number;
  total:           number;  // ✅ FIX: alias for totalAmount — OrderHistory card uses `order.total`

  deliveryAddress: DeliveryAddress;

  promoCode?:      string;

  createdAt:       string;
  updatedAt:       string;
}

// ─── Paginated list ───────────────────────────────────────────────────────────

export interface OrderPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface OrderListResult {
  orders:     Order[];
  pagination: OrderPagination;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  items: {
    product:  string;
    name:     string;
    quantity: number;
    price:    number;
  }[];
  deliveryAddress: DeliveryAddress;
  promoCode?:      string;
}