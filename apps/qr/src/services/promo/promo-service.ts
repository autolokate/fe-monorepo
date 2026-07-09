import { validatePromo as validatePromoApi } from '@autolokate/api-client';

import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout.js';
import { getQrApiClient } from '@/platform/api/qr-api-client.js';
import { mapPurchasePlanIdToApiTier } from '@/services/plan/plan-mapper.js';
import { buildCheckoutParamsKey } from '@/services/checkout/checkout-mapper.js';
import { updateCheckoutState } from '@/services/checkout/checkout-cache.js';
import type { CheckoutParams } from '@/services/checkout/checkout-mapper.js';

import { mapPromoApiError, type PromoError } from './promo-errors.js';
import { mapPromoPreviewToSummary } from './promo-mapper.js';
import { promoLogger } from './promo-logger.js';

export type ValidatePromoCheckoutInput = {
  purchaseQrCode: string;
  planId: PurchasePlanId;
  riderCount: PurchaseRiderCount;
  promoCode: string;
};

export type ValidatePromoCheckoutResult =
  | { ok: true; promoCode: string }
  | { ok: false; error: PromoError };

/** POST /v1/promos/validate — cache preview totals for R08b. */
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

  try {
    const client = getQrApiClient();
    promoLogger.info('promo_validate_request', {
      planId: input.planId,
      riderCount: input.riderCount,
      promoCode,
    });

    const preview = await validatePromoApi(client, {
      code: input.purchaseQrCode,
      planTier: mapPurchasePlanIdToApiTier(input.planId),
      riderCount: input.riderCount,
      promoCode,
    });

    const checkoutParams: CheckoutParams = {
      planId: input.planId,
      riderCount: input.riderCount,
      promoApplied: true,
      promoCode: preview.promoCode,
    };

    updateCheckoutState({
      orderId: null,
      orderStatus: null,
      paymentRef: null,
      providerOrderId: null,
      razorpayKeyId: null,
      totalPaise: preview.totalPaise,
      createIdempotencyKey: null,
      payIdempotencyKey: null,
      orderSummary: mapPromoPreviewToSummary(preview, {
        planId: input.planId,
        riderCount: input.riderCount,
      }),
      paramsKey: buildCheckoutParamsKey(checkoutParams),
    });

    promoLogger.info('promo_validate_response', {
      promoCode: preview.promoCode,
      discountPaise: preview.discountPaise,
      totalPaise: preview.totalPaise,
    });

    return { ok: true, promoCode: preview.promoCode };
  } catch (error) {
    promoLogger.warn('promo_validate_failed', { error });
    return { ok: false, error: mapPromoApiError(error) };
  }
}
