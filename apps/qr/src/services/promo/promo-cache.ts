import { clearCartPricingCache } from '@/services/checkout/checkout-cache';

/** Drop promo-priced preview so R08 returns to catalog totals. */
export function clearPromoPreviewCache(): void {
  clearCartPricingCache();
}
