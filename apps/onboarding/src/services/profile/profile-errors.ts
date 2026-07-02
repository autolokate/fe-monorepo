import { normalizeApiError } from '@autolokate/api-client';

import type { AuthVehicleOwnerState } from '@/features/shared-auth/types.js';

export type MappedProfileError = { type: 'offline' } | { type: 'save_failed' };

/** Map normalized API errors into existing vehicle-owner UI states only. */
export function mapProfileApiError(error: unknown): MappedProfileError {
  const normalized = normalizeApiError(error);

  if (normalized.code === 'offline') {
    return { type: 'offline' };
  }

  return { type: 'save_failed' };
}

export function applyVehicleOwnerSaveError(_error: MappedProfileError): AuthVehicleOwnerState {
  return 'error';
}
