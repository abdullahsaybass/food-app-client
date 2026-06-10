/**
 * order.types.ts
 *
 * Domain types for the order feature only.
 *
 * REMOVED: OrderStackParamList (was duplicated 3x — now lives in navigation.types.ts)
 * REMOVED: duplicate SavedAddress (canonical definition is right here — used everywhere)
 */

// ─── Delivery address (sent in order payload) ─────────────────────────────────

export interface DeliveryAddress {
  fullName:   string;
  phone:      string;
  street:     string;
  city:       string;
  state:      string;      // required by backend
  postalCode: string;      // required by backend (6 digits)
  country?:   string;      // defaults to "India" on backend
  label?:     'home' | 'work' | 'other';
}

// ─── Saved address (stored in user profile) ───────────────────────────────────
// Optional fields because a saved address may be incomplete.
// When building PlaceOrderPayload, fill missing fields with '' fallback.

export interface SavedAddress {
  _id?:        string;
  label?:      'home' | 'work' | 'other';
  fullName?:   string;
  phone?:      string;
  street:      string;
  city:        string;
  state?:      string;
  postalCode?: string;
  country?:    string;
  isDefault?:  boolean;
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
  total:           number;
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

// ─── Place order payload ──────────────────────────────────────────────────────
//
// Matches backend Joi validator exactly:
//   items[].product  → MongoDB ObjectId string
//   items[].unit     → variant unit e.g. "1kg" (backend resolves price)
//   items[].quantity → integer >= 1
//   shippingAddress  → full address (state + postalCode required)
//   addressId        → use a saved address _id instead of shippingAddress

export interface PlaceOrderPayload {
  items: {
    product:  string;   // product MongoDB _id
    unit:     string;   // variant unit e.g. "1kg", "500g"
    quantity: number;
  }[];
  shippingAddress?: DeliveryAddress;
  addressId?:       string;
}