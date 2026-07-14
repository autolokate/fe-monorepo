import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

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

  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const mapped = error as { code: string; message: string };
    if (mapped.code === 'promo_invalid') {
      return { code: 'promo_invalid', message: mapped.message };
    }
    if (mapped.code === 'offline') {
      return { code: 'offline', message: mapped.message };
    }
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

  // Swagger: upgrade/renewal carts reject promo with validation 400; invalid codes often 422.
  if (normalized.code === 'validation' || normalized.status === 400 || normalized.status === 422) {
    return { code: 'promo_invalid', message };
  }

  return { code: 'unavailable', message };
}
