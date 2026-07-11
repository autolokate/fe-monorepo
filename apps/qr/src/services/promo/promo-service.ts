import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout';
import { buildCheckoutParamsKey, type CheckoutParams } from '@/services/checkout/checkout-mapper';
import { priceCheckoutCart } from '@/services/cart/index';

import { mapPromoApiError, type PromoError } from './promo-errors';
import { promoLogger } from './promo-logger';

export type ValidatePromoCheckoutInput = {
  purchaseQrCode: string;
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoCode: string;
};

export type ValidatePromoCheckoutResult =
  | { ok: true; promoCode: string }
  | { ok: false; error: PromoError };

/** POST /v1/cart with promoCode — server-priced preview for R08b. */
export async function validatePromoCheckout(
  input: ValidatePromoCheckoutInput,
): Promise<ValidatePromoCheckoutResult> {
  const promoCode = input.promoCode.trim().toUpperCase();
  if (!promoCode) {
    return {
      ok: false,
      error: { code: 'promo_invalid', message: 'Enter a promo code to apply.' },
    };
  }

  const checkoutParams: CheckoutParams = {
    planId: input.planId,
    riderCount: input.riderCount,
    promoApplied: true,
    promoCode,
  };

  promoLogger.info('promo_cart_request', {
    planId: input.planId,
    riderCount: input.riderCount,
    promoCode,
  });

  const result = await priceCheckoutCart(checkoutParams);
  if (!result.ok) {
    promoLogger.warn('promo_cart_failed', { error: result.error });
    if (result.error.code === 'promo_invalid') {
      return { ok: false, error: { code: 'promo_invalid', message: result.error.message } };
    }
    return { ok: false, error: mapPromoApiError(result.error) };
  }

  promoLogger.info('promo_cart_response', {
    promoCode,
    paramsKey: buildCheckoutParamsKey(checkoutParams),
  });

  return { ok: true, promoCode };
}
