/**
 * order.types.ts
 *
 * Aligned with backend:
 *  - "zip" not "postalCode"
 *  - country defaults to "Maldives"
 *  - shippingAddress (not deliveryAddress)
 *  - statusTimeline with { status, statusLabel, note, at }
 *  - orderNumber, statusLabel, paymentStatus, estimatedDeliveryAt, cancelledBy, cancelReason added
 */

// ─── Delivery address (sent in order payload) ─────────────────────────────────
// Field names match backend Joi validator exactly.

export interface DeliveryAddress {
  fullName:      string;
  phone:         string;
  street:        string;
  city:          string;
  state:         string;
  zip:           string;           // backend field is "zip", NOT "postalCode"
  country?:      string;           // must be "Maldives" or "MV"
  label?:        string;
  location?: {
    latitude:  number | null;
    longitude: number | null;
  };
  locationLabel?: string;
}

// ─── Saved address (stored in user profile) ───────────────────────────────────

export interface SavedAddress {
  _id?:         string;
  label?:       string;
  fullName?:    string;
  phone?:       string;
  street:       string;
  city:         string;
  state?:       string;
  zip?:         string;            // backend field is "zip", NOT "postalCode"
  country?:     string;
  isDefault?:   boolean;
  location?: {
    latitude:  number | null;
    longitude: number | null;
  };
  locationLabel?: string;
}

// ─── Order item ───────────────────────────────────────────────────────────────

export interface OrderProduct {
  id:    string;
  name:  string;
  image: string | null;
  price: number;
  unit:  string;
}

export interface OrderItem {
  product:  OrderProduct;
  unit:     string;
  quantity: number;
  price:    number;
  subtotal: number;
}

// ─── Status timeline entry ────────────────────────────────────────────────────
// Matches backend order.mapper.js → mapTimelineEntry()

export interface StatusTimelineEntry {
  status:      string;
  statusLabel: string;
  note:        string | null;
  at:          string;             // ISO date string, field is "at" not "timestamp"
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'           // Order Placed
  | 'confirmed'         // Confirmed
  | 'packing'           // Packing
  | 'out_for_delivery'  // Out for Delivery
  | 'delivered'         // Delivered
  | 'cancelled';

export interface Order {
  id:                  string;
  orderNumber:         string;     // e.g. "FSH0001"
  status:              OrderStatus;
  statusLabel:         string;     // e.g. "On the Way"
  paymentMethod:       string;     // always "cod"
  paymentStatus:       string;     // "pending" | "paid" | "refunded"
  items:               OrderItem[];
  subtotal:            number;
  shippingFee:         number;
  discount:            number;
  totalAmount:         number;
  deliveryCharge:      number;   // from backend delivery zone
  itemsTotal:          number;   // totalAmount - deliveryCharge
  shippingAddress:     DeliveryAddress;   // field is "shippingAddress", NOT "deliveryAddress"
  statusTimeline:      StatusTimelineEntry[];
  estimatedDeliveryAt: string | null;
  cancelledBy:         'user' | 'admin' | null;
  cancelReason:        string | null;
  createdAt:           string;
  updatedAt:           string;
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

// ─── Place order payload ──────────────────────────────────────────────────────
// Matches backend Joi validator (order.validator.js) exactly.

export interface PlaceOrderPayload {
  items: {
    product:  string;   // MongoDB ObjectId string
    unit:     string;   // variant unit e.g. "1kg", "500g"
    quantity: number;
  }[];
  shippingAddress?: DeliveryAddress;
  addressId?:       string;
}