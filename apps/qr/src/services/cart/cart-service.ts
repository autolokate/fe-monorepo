import { createCart as createCartApi } from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';
import { getPlanVersionId } from '@/services/plan/plan-mapper';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service';
import {
  getCheckoutRevision,
  readCheckoutState,
  updateCheckoutState,
} from '@/services/checkout/checkout-cache';
import {
  buildCheckoutParamsKey,
  type CheckoutParams,
} from '@/services/checkout/checkout-mapper';
import { mapCheckoutApiError, type CheckoutError } from '@/services/checkout/checkout-errors';
import { resolveOrderQrCode } from '@/services/checkout/resolve-order-qr-code';

import { getInflightPriceCart, setInflightPriceCart } from './cart-cache';

import { mapCartToSummary } from './cart-mapper';
import { cartLogger } from './cart-logger';

export type PriceCartResult =
  | { ok: true; revision: number }
  | { ok: false; error: CheckoutError };

function isCartExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return true;
  }
  return Date.now() >= new Date(expiresAt).getTime();
}

function resolvePlanVersionId(params: CheckoutParams): string | null {
  const catalog = getPurchasePlansCatalog();
  return getPlanVersionId(catalog, params.planId);
}

async function createCartForParams(
  params: CheckoutParams,
  options?: { force?: boolean },
): Promise<PriceCartResult> {
  const purchaseQrCode = resolveOrderQrCode();
  if (!purchaseQrCode) {
    cartLogger.warn('price_cart_blocked', { reason: 'missing_purchase_qr_code' });
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing purchase QR code.' },
    };
  }

  const planVersionId = resolvePlanVersionId(params);
  if (!planVersionId) {
    cartLogger.warn('price_cart_blocked', { reason: 'missing_plan_version_id', planId: params.planId });
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Plan pricing is not available yet.' },
    };
  }

  const paramsKey = buildCheckoutParamsKey(params);
  const current = readCheckoutState();

  if (
    !options?.force &&
    current.orderSummary &&
    current.paramsKey === paramsKey &&
    current.cartId &&
    !isCartExpired(current.cartExpiresAt)
  ) {
    cartLogger.debug('price_cart_cached', { cartId: current.cartId, paramsKey });
    return { ok: true, revision: getCheckoutRevision() };
  }

  const body: {
    code: string;
    planId: string;
    riderCount: number;
    promoCode?: string;
  } = {
    code: purchaseQrCode,
    planId: planVersionId,
    riderCount: params.riderCount,
  };

  if (params.promoApplied && params.promoCode?.trim()) {
    body.promoCode = params.promoCode.trim().toUpperCase();
  }

  try {
    const client = getQrApiClient();
    cartLogger.info('cart_create_request', {
      planId: body.planId,
      riderCount: body.riderCount,
      hasPromo: Boolean(body.promoCode),
    });

    const cart = await createCartApi(client, body);
    const orderSummary = mapCartToSummary(cart, {
      planId: params.planId,
      riderCount: params.riderCount,
    });

    updateCheckoutState({
      cartId: cart.cartId,
      cartExpiresAt: cart.expiresAt,
      planPricePaise: cart.planPricePaise,
      riderCoverPaise: cart.riderCoverPaise,
      discountPaise: cart.discountPaise,
      appliedPromoCode: cart.appliedPromoCode ?? null,
      orderId: null,
      orderStatus: null,
      paymentRef: null,
      providerOrderId: null,
      razorpayKeyId: null,
      createIdempotencyKey: null,
      payIdempotencyKey: null,
      orderSummary,
      totalPaise: cart.totalPaise,
      paramsKey,
    });

    cartLogger.info('cart_create_response', {
      cartId: cart.cartId,
      totalPaise: cart.totalPaise,
      discountPaise: cart.discountPaise,
      expiresAt: cart.expiresAt,
    });

    return { ok: true, revision: getCheckoutRevision() };
  } catch (error) {
    cartLogger.warn('cart_create_failed', { error });
    return { ok: false, error: mapCheckoutApiError(error) };
  }
}

/** POST /v1/cart — server-priced order summary for R08 (15-minute snapshot). */
export async function priceCheckoutCart(
  params: CheckoutParams,
  options?: { force?: boolean },
): Promise<PriceCartResult> {
  cartLogger.info('price_cart_start', {
    planId: params.planId,
    riderCount: params.riderCount,
    promoApplied: params.promoApplied ?? false,
  });

  const inflight = getInflightPriceCart();
  if (inflight) {
    return (await inflight) as PriceCartResult;
  }

  const promise = createCartForParams(params, options);
  setInflightPriceCart(promise);

  try {
    return await promise;
  } finally {
    setInflightPriceCart(null);
  }
}
