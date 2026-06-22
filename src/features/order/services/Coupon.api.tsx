/**
 * coupon.api.ts
 */

import { API } from '../../../app/lib/api';

export interface ApplyCouponResult {
  code:          string;
  discount:      number;   // absolute MVR amount off  ← mapped from backend's discountAmount
  discountType:  'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;   // raw % or fixed value from the coupon
  message:       string;
}

export const couponApi = {
  apply: async (code: string, cartTotal: number): Promise<ApplyCouponResult> => {
    // Backend: POST /coupons/apply → { success, message, data: { code, discountAmount, discountType, discountValue, message } }
    const { data } = await API.post('/coupons/apply', { code, orderTotal: cartTotal });
    const payload = data?.data ?? data;  // unwrap ApiResponse envelope

    return {
      code:          payload.code          ?? code.toUpperCase(),
      discount:      payload.discountAmount ?? payload.discount ?? 0,  // backend field is "discountAmount"
      discountType:  payload.discountType  ?? 'fixed',
      discountValue: payload.discountValue ?? 0,
      message:       payload.message       ?? 'Coupon applied!',
    };
  },
};
