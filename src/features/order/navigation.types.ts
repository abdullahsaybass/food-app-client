/**
 * navigation.types.ts  (order module)
 * Param list for the order stack navigator.
 */

export type OrderStackParamList = {
  Checkout:     undefined;
  OrderSuccess: { orderId: string };
  OrderHistory: undefined;
  OrderDetail:  { orderId: string };
};