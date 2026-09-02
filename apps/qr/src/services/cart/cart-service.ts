import {
  createCart as createCartApi,
  updateCart as updateCartApi,
  type CartDto,
  type PatchCartBody,
} from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';
import { getPlanVersionId } from '@/services/plan/plan-mapper';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service';
import {
  clearCartPricingCache,
  getCheckoutRevision,
  peekCartId,
  readCheckoutState,
  updateCheckoutState,
} from '@/services/checkout/checkout-cache';
import { buildCheckoutParamsKey, type CheckoutParams } from '@/services/checkout/checkout-mapper';
import {
  isRefreshableCartError,
  mapCheckoutApiError,
  type CheckoutError,
} from '@/services/checkout/checkout-errors';
import { resolveOrderQrCode } from '@/services/checkout/resolve-order-qr-code';
import { getVehicle } from '@/storage/index';
import { compactPlate, normalizePlate } from '@/services/vehicle/vehicle-plate';

import { getInflightPriceCart, setInflightPriceCart } from './cart-cache';

import { mapCartToSummary } from './cart-mapper';
import { cartLogger } from './cart-logger';

export type PriceCartResult = { ok: true; revision: number } | { ok: false; error: CheckoutError };

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

function resolveCartRegistration(): string | undefined {
  const vehicle = getVehicle();
  if (!vehicle) {
    return undefined;
  }
  const plate = vehicle.registration.trim();
  if (!plate) {
    return undefined;
  }
  return compactPlate(normalizePlate(plate));
}

function desiredPromoCode(params: CheckoutParams): string | null {
  if (!params.promoApplied) {
    return null;
  }
  const code = params.promoCode?.trim().toUpperCase();
  return code || null;
}

function persistCartSnapshot(cart: CartDto, params: CheckoutParams, paramsKey: string): void {
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
    // Cart edits invalidate any draft order — recreate once at Pay.
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
}

/** PATCH plan/riders/registration only — never touch promoCode (Swagger: upgrade rejects it). */
async function patchExistingCartBase(
  cartId: string,
  params: CheckoutParams,
): Promise<PriceCartResult> {
  const planVersionId = resolvePlanVersionId(params);
  if (!planVersionId) {
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Plan pricing is not available yet.' },
    };
  }

  const registration = resolveCartRegistration();
  const paramsKey = buildCheckoutParamsKey(params);
  const body: PatchCartBody = {
    planId: planVersionId,
    riderCount: params.riderCount,
    ...(registration ? { registration } : {}),
  };

  try {
    const client = getQrApiClient();
    cartLogger.info('cart_patch_request', {
      cartId,
      planId: planVersionId,
      riderCount: params.riderCount,
      hasRegistration: Boolean(registration),
      fields: Object.keys(body),
    });

    const cart = await updateCartApi(client, cartId, body);

    persistCartSnapshot(cart, params, paramsKey);
    cartLogger.info('cart_patch_response', {
      cartId: cart.cartId,
      totalPaise: cart.totalPaise,
      discountPaise: cart.discountPaise,
      appliedPromoCode: cart.appliedPromoCode ?? null,
    });
    return { ok: true, revision: getCheckoutRevision() };
  } catch (error) {
    cartLogger.warn('cart_patch_failed', { error, cartId });
    if (isRefreshableCartError(error)) {
      clearCartPricingCache();
      return createCartForParams(params, { force: true });
    }
    return { ok: false, error: mapCheckoutApiError(error) };
  }
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
    cartLogger.warn('price_cart_blocked', {
      reason: 'missing_plan_version_id',
      planId: params.planId,
    });
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Plan pricing is not available yet.' },
    };
  }

  const paramsKey = buildCheckoutParamsKey(params);
  const current = readCheckoutState();
  const promoCode = desiredPromoCode(params);
  const registration = resolveCartRegistration();

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

  // Reuse live cart when plan/rider match — apply promo via a separate promo-only PATCH.
  if (
    !options?.force &&
    current.cartId &&
    !isCartExpired(current.cartExpiresAt) &&
    current.orderSummary
  ) {
    const currentBase = current.paramsKey?.split(':').slice(0, 2).join(':');
    const nextBase = `${params.planId}:${String(params.riderCount)}`;
    if (currentBase === nextBase) {
      const applied = (current.appliedPromoCode ?? '').trim().toUpperCase() || null;
      const want = promoCode;

      if (applied === want) {
        // Totals already match desired promo state — refresh paramsKey without a network call.
        updateCheckoutState({ paramsKey });
        return { ok: true, revision: getCheckoutRevision() };
      }

      if (want !== null || applied !== null) {
        return patchCheckoutCartPromo(params, want);
      }

      return { ok: true, revision: getCheckoutRevision() };
    }
  }

  try {
    const client = getQrApiClient();
    const body = {
      code: purchaseQrCode,
      planId: planVersionId,
      riderCount: params.riderCount,
      ...(registration ? { registration } : {}),
    };

    cartLogger.info('cart_create_request', {
      planId: body.planId,
      riderCount: body.riderCount,
      hasRegistration: Boolean(registration),
    });

    let cart = await createCartApi(client, body);

    // Promo is always applied via PATCH { promoCode } — never embedded in POST.
    if (promoCode) {
      cartLogger.info('cart_promo_patch_after_create', { cartId: cart.cartId, promoCode });
      cart = await updateCartApi(client, cart.cartId, { promoCode });
    }

    persistCartSnapshot(cart, params, paramsKey);

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

/** Price (or re-price) the checkout cart. Promo uses PATCH when a cart already exists. */
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

/**
 * PATCH /v1/cart/{cartId} — apply or clear promo.
 * Swagger payload for promo-only edit: `{ "promoCode": "FRIEND50" }` or `{ "promoCode": null }`.
 */
export async function patchCheckoutCartPromo(
  params: CheckoutParams,
  promoCode: string | null,
): Promise<PriceCartResult> {
  const cartId = peekCartId();
  const current = readCheckoutState();

  if (!cartId || isCartExpired(current.cartExpiresAt)) {
    return priceCheckoutCart(
      {
        ...params,
        promoApplied: Boolean(promoCode),
        promoCode,
      },
      { force: true },
    );
  }

  const paramsKey = buildCheckoutParamsKey({
    ...params,
    promoApplied: Boolean(promoCode),
    promoCode,
  });

  try {
    const client = getQrApiClient();
    // Promo-only body — do not re-send planId/riderCount/registration.
    const body: PatchCartBody = { promoCode };
    cartLogger.info('cart_promo_patch_request', { cartId, promoCode });

    const cart = await updateCartApi(client, cartId, body);
    persistCartSnapshot(
      cart,
      {
        ...params,
        promoApplied: Boolean(promoCode),
        promoCode,
      },
      paramsKey,
    );

    cartLogger.info('cart_promo_patch_response', {
      cartId: cart.cartId,
      totalPaise: cart.totalPaise,
      discountPaise: cart.discountPaise,
      appliedPromoCode: cart.appliedPromoCode ?? null,
    });
    return { ok: true, revision: getCheckoutRevision() };
  } catch (error) {
    cartLogger.warn('cart_promo_patch_failed', { error, cartId });
    if (isRefreshableCartError(error)) {
      clearCartPricingCache();
      return createCartForParams(
        {
          ...params,
          promoApplied: Boolean(promoCode),
          promoCode,
        },
        { force: true },
      );
    }
    return { ok: false, error: mapCheckoutApiError(error) };
  }
}

/** Re-PATCH plan/riders without touching promo (used when shelf tier changes). */
export async function patchCheckoutCartPlan(params: CheckoutParams): Promise<PriceCartResult> {
  const cartId = peekCartId();
  const current = readCheckoutState();
  if (!cartId || isCartExpired(current.cartExpiresAt)) {
    return priceCheckoutCart(params, { force: true });
  }
  return patchExistingCartBase(cartId, params);
}
