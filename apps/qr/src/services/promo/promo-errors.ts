import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error.js';

export type PromoErrorCode = 'promo_invalid' | 'offline' | 'unavailable' | 'unknown';

export type PromoError = {
  code: PromoErrorCode;
  message: string;
};

export function mapPromoApiError(error: unknown): PromoError {
  if (error instanceof ApiError && error.code === 'promo_invalid') {
    return {
      code: 'promo_invalid',
      message: resolveUserFacingMessage(error),
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

  if (normalized.status === 422) {
    return { code: 'promo_invalid', message };
  }

  return { code: 'unavailable', message };
}
