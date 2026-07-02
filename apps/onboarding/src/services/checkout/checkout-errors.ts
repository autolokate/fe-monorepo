import { normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error.js';

export type CheckoutErrorCode =
  | 'offline'
  | 'promo_invalid'
  | 'unavailable'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'unknown';

export type CheckoutError = {
  code: CheckoutErrorCode;
  message: string;
};

/** Map API failures into existing purchase checkout UI branches only. */
export function mapCheckoutApiError(error: unknown): CheckoutError {
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
