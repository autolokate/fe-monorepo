import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

export type QrAttachErrorCode =
  | 'already_attached'
  | 'vehicle_already_subscribed'
  | 'invalid'
  | 'missing_qr_code'
  | 'offline'
  | 'not_provisioned'
  | 'unavailable';

export type QrAttachError = {
  code: QrAttachErrorCode;
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

/** Map attach API failures into existing purchase attach UI branches. */
export function mapQrAttachApiError(error: unknown): QrAttachError {
  const normalized = normalizeApiError(error);
  const apiCode = readErrorCode(error) ?? readErrorCode(normalized.details);
  const message = resolveUserFacingMessage(error);

  if (
    normalized.code === 'offline' ||
    normalized.code === 'network' ||
    normalized.code === 'timeout'
  ) {
    return { code: 'offline', message };
  }

  if (
    apiCode === 'vehicle_already_subscribed' ||
    apiCode === 'vehicle_already_linked'
  ) {
    return { code: 'vehicle_already_subscribed', message };
  }

  if (apiCode === 'already_attached' || normalized.status === 409) {
    return { code: 'already_attached', message };
  }

  if (apiCode === 'not_provisioned') {
    return { code: 'not_provisioned', message };
  }

  if (
    normalized.status === 404 ||
    normalized.code === 'validation' ||
    apiCode === 'channel_journey_mismatch'
  ) {
    return { code: 'invalid', message };
  }

  return { code: 'unavailable', message };
}
