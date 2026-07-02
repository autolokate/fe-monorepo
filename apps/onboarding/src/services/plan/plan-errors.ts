import { normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error.js';

export type PlanLoadErrorCode = 'offline' | 'unavailable' | 'unknown';

export type PlanLoadError = {
  code: PlanLoadErrorCode;
  message: string;
};

/** Map API failures for headless plan prefetch (no new purchase UI states). */
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
    normalized.status === 404 ||
    normalized.status === 500
  ) {
    return { code: 'unavailable', message };
  }

  return { code: 'unknown', message };
}
