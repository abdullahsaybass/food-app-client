/**
 * coupon.api.ts
 */

import { API } from '../../../app/lib/api';

export interface ApplyCouponResult {
  discount: number;      // absolute amount off
  discountType: 'percentage' | 'fixed';
  discountValue: number; // the raw % or fixed value from the coupon
  message: string;
}

export const couponApi = {
  apply: async (code: string, cartTotal: number): Promise<ApplyCouponResult> => {
    const { data } = await API.post('/coupons/apply', { code, orderTotal: cartTotal });
    return data;
  },
};