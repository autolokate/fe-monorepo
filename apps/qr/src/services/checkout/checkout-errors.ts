import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

export type CheckoutErrorCode =
  | 'offline'
  | 'promo_invalid'
  | 'cart_stale'
  | 'catalog_stale'
  | 'unavailable'
  | 'order_in_progress'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'unknown';

export type CheckoutError = {
  code: CheckoutErrorCode;
  message: string;
};

const REFRESHABLE_CART_CODES = new Set(['cart_expired', 'cart_stale']);
const CATALOG_STALE_CODES = new Set(['plan_version_superseded', 'tier_not_offered']);

export function isRefreshableCartError(error: unknown): boolean {
  if (!(error instanceof ApiError) || !error.code) {
    return false;
  }
  return REFRESHABLE_CART_CODES.has(error.code) || error.code === 'not_found';
}

export function isCatalogStaleError(error: unknown): boolean {
  return error instanceof ApiError && Boolean(error.code && CATALOG_STALE_CODES.has(error.code));
}

export function isRefreshableCheckoutError(error: unknown): boolean {
  return isRefreshableCartError(error) || isCatalogStaleError(error);
}

/** Map API failures into existing purchase checkout UI branches only. */
export function mapCheckoutApiError(error: unknown): CheckoutError {
  if (error instanceof ApiError && error.code === 'promo_invalid') {
    return {
      code: 'promo_invalid',
      message: resolveUserFacingMessage(error),
    };
  }

  if (error instanceof ApiError && error.code === 'order_in_progress') {
    return {
      code: 'order_in_progress',
      message: resolveUserFacingMessage(error),
    };
  }

  if (
    error instanceof ApiError &&
    error.code &&
    (REFRESHABLE_CART_CODES.has(error.code) || error.code === 'not_found')
  ) {
    return {
      code: 'cart_stale',
      // Prefer endpoint copy ("No such cart.") over a generic stale-cart string.
      message: resolveUserFacingMessage(error),
    };
  }

  if (error instanceof ApiError && error.code && CATALOG_STALE_CODES.has(error.code)) {
    return {
      code: 'catalog_stale',
      message: 'Plan pricing was updated. Review your order and try again.',
    };
  }

  const normalized = normalizeApiError(error);
  const message = resolveUserFacingMessage(error);

  if (
    normalized.code === 'offline' ||
    normalized.code === 'timeout' ||
    normalized.code === 'network'
  ) {
    return { code: 'offline', message };
  }

  if (normalized.code === 'validation' || normalized.status === 400 || normalized.status === 422) {
    if (message.toLowerCase().includes('promo')) {
      return { code: 'promo_invalid', message };
    }
    return { code: 'unavailable', message };
  }

  if (normalized.code === 'rate_limit' || normalized.status === 500 || normalized.status === 404) {
    return { code: 'unavailable', message };
  }

  if (normalized.status === 409) {
    return { code: 'unavailable', message };
  }

  return { code: 'unknown', message };
}
