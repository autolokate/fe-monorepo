import { ApiError, normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

import { showErrorToast } from './toast';

type Logger = {
  warn: (event: string, context?: Record<string, unknown>) => void;
};

export type ReportUserErrorOptions = {
  /** When false, log only — never show a snackbar. Default: toast only for API-backed failures. */
  toast?: boolean;
};

/** Codes that always come from a backend response body (even after domain mapping). */
const API_DOMAIN_CODES = new Set([
  'vehicle_already_subscribed',
  'vehicle_already_linked',
  'already_attached',
  'not_provisioned',
  'channel_journey_mismatch',
  'promo_invalid',
  'plan_unavailable',
  'payment_failed',
  'otp_expired',
  'otp_invalid',
  'rate_limited',
  'unauthorized',
  'vehicle_not_found',
  'catalog_stale',
  'cart_stale',
  'payment_cancelled',
]);

function readErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
}

/** True when the failure came from (or clearly maps to) an HTTP/API response. */
export function isApiBackedError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return true;
  }

  const code = readErrorCode(error);
  if (code && API_DOMAIN_CODES.has(code)) {
    return true;
  }

  // Feature mappers sometimes collapse HTTP failures into coarse domain codes.
  if (code === 'network' || code === 'server' || code === 'offline') {
    return true;
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number' && status > 0) {
      return true;
    }
  }

  const normalized = normalizeApiError(error);
  if (normalized.status != null && normalized.status > 0) {
    return true;
  }

  return (
    normalized.code === 'offline' ||
    normalized.code === 'network' ||
    normalized.code === 'timeout' ||
    normalized.code === 'server_error' ||
    normalized.code === 'rate_limit' ||
    normalized.code === 'unauthorized' ||
    normalized.code === 'expired'
  );
}

/**
 * Log structured context for engineers.
 * Snackbar only for API-backed failures (never for client-side skips like missing local ids).
 */
export function reportUserError(
  logger: Logger,
  event: string,
  error: unknown,
  fallback?: string,
  options?: ReportUserErrorOptions,
): string {
  const message = resolveUserFacingMessage(error, fallback);
  logger.warn(event, { error, userMessage: message });

  const shouldToast = options?.toast ?? isApiBackedError(error);
  if (shouldToast) {
    showErrorToast(message);
  }

  return message;
}
