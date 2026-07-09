import { updateCheckoutState } from '@/services/checkout/checkout-cache.js';

/** Drop promo-priced preview so R08 returns to catalog totals. */
export function clearPromoPreviewCache(): void {
  updateCheckoutState({
    orderId: null,
    orderStatus: null,
    paymentRef: null,
    providerOrderId: null,
    razorpayKeyId: null,
    totalPaise: null,
    createIdempotencyKey: null,
    payIdempotencyKey: null,
    orderSummary: null,
    paramsKey: null,
  });
}
