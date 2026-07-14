import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout';
import { buildCheckoutParamsKey, type CheckoutParams } from '@/services/checkout/checkout-mapper';
import { patchCheckoutCartPromo, priceCheckoutCart } from '@/services/cart/index';

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

/**
 * Apply a promo via PATCH /v1/cart/{cartId} with body `{ promoCode }` (Swagger PatchCartBodyDto).
 * Ensures a cart exists first (POST once), then patches — never re-POSTs for promo alone.
 */
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

  const baseParams: CheckoutParams = {
    planId: input.planId,
    riderCount: input.riderCount,
    promoApplied: false,
    promoCode: null,
  };

  promoLogger.info('promo_cart_request', {
    planId: input.planId,
    riderCount: input.riderCount,
    promoCode,
  });

  // Ensure a cart exists without embedding the promo in POST.
  const priced = await priceCheckoutCart(baseParams);
  if (!priced.ok) {
    promoLogger.warn('promo_cart_base_failed', { error: priced.error });
    return { ok: false, error: mapPromoApiError(priced.error) };
  }

  const patched = await patchCheckoutCartPromo(baseParams, promoCode);
  if (!patched.ok) {
    promoLogger.warn('promo_cart_patch_failed', { error: patched.error });
    if (patched.error.code === 'promo_invalid') {
      return { ok: false, error: { code: 'promo_invalid', message: patched.error.message } };
    }
    return { ok: false, error: mapPromoApiError(patched.error) };
  }

  promoLogger.info('promo_cart_response', {
    promoCode,
    paramsKey: buildCheckoutParamsKey({
      ...baseParams,
      promoApplied: true,
      promoCode,
    }),
  });

  return { ok: true, promoCode };
}
