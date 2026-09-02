import { normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

export type PlanLoadErrorCode = 'offline' | 'unavailable' | 'unknown';

export type PlanLoadError = {
  code: PlanLoadErrorCode;
  message: string;
};

/** Map API failures for plan prefetch — keeps the endpoint message for the error screen. */
export function mapPlanApiError(error: unknown): PlanLoadError {
  const normalized = normalizeApiError(error);
  const message = resolveUserFacingMessage(error);

  if (
    normalized.code === 'offline' ||
    normalized.code === 'timeout' ||
    normalized.code === 'network'
  ) {
    return { code: 'offline', message };
  }

  if (
    normalized.code === 'rate_limit' ||
    normalized.code === 'server_error' ||
    normalized.code === 'unauthorized' ||
    normalized.status === 403 ||
    normalized.status === 404 ||
    normalized.status === 500
  ) {
    return { code: 'unavailable', message };
  }

  return { code: 'unknown', message };
}
