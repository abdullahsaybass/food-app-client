/**
 * navigation.types.ts  (order module)
 * Param list for the order stack navigator.
 */

interface SavedAddress {
  _id?:        string;
  label?:      'home' | 'work' | 'other';
  fullName?:   string;
  street:      string;
  city:        string;
  state?:      string;
  postalCode?: string;
  country?:    string;
  isDefault?:  boolean;
}

export type OrderStackParamList = {
  Checkout:       { selectedAddress?: SavedAddress } | undefined;
  SelectAddress:  undefined;
  OrderSuccess:   { orderId: string };
  OrderHistory:   undefined;
  OrderDetail:    { orderId: string };
};