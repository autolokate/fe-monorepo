import { ApiError, normalizeApiError } from '@autolokate/api-client';

export type ActivationErrorCode =
  | 'not_found'
  | 'already_redeemed'
  | 'wrong_vehicle'
  | 'channel_mismatch'
  | 'revoked'
  | 'suspended'
  | 'expired'
  | 'invalid'
  | 'offline'
  | 'timeout'
  | 'server_error'
  | 'unavailable';

export type ActivationError = {
  code: ActivationErrorCode;
  message: string;
};

function readErrorCode(error: unknown): string | null {
  if (error instanceof ApiError && error.code) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

function isTransientError(normalized: ReturnType<typeof normalizeApiError>): boolean {
  return (
    normalized.code === 'offline' ||
    normalized.code === 'network' ||
    normalized.code === 'timeout' ||
    normalized.status === 502 ||
    normalized.status === 503 ||
    normalized.status === 504
  );
}

export function isActivationTransientError(error: unknown): boolean {
  return isTransientError(normalizeApiError(error));
}

/** Map API failures into welcome / redeem UI branches and toast messages. */
export function mapActivationApiError(error: unknown): ActivationError {
  const normalized = normalizeApiError(error);
  const apiCode = readErrorCode(error) ?? readErrorCode(normalized.details);
  const message = normalized.message;

  if (isTransientError(normalized)) {
    return {
      code: normalized.code === 'timeout' ? 'timeout' : 'offline',
      message,
    };
  }

  if (apiCode === 'not_found' || normalized.status === 404) {
    return { code: 'not_found', message };
  }

  if (
    apiCode === 'already_redeemed' ||
    apiCode === 'already_attached' ||
    message.toLowerCase().includes('already redeemed')
  ) {
    return { code: 'already_redeemed', message };
  }

  if (apiCode === 'wrong_vehicle') {
    return { code: 'wrong_vehicle', message };
  }

  if (apiCode === 'channel_journey_mismatch') {
    return { code: 'channel_mismatch', message };
  }

  if (apiCode === 'revoked') {
    return { code: 'revoked', message };
  }

  if (apiCode === 'entitlement_suspended') {
    return { code: 'suspended', message };
  }

  if (message.toLowerCase().includes('expir')) {
    return { code: 'expired', message };
  }

  if (normalized.code === 'validation' || apiCode === 'not_provisioned') {
    return { code: 'invalid', message };
  }

  if (normalized.code === 'server_error' || normalized.status === 500) {
    return { code: 'server_error', message };
  }

  if (normalized.status === 409) {
    return { code: 'already_redeemed', message };
  }

  return { code: 'unavailable', message };
}
