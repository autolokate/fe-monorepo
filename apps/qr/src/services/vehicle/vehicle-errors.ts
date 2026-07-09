import { normalizeApiError } from '@autolokate/api-client';

import { resolveUserFacingMessage } from '@/platform/errors/user-facing-error';

export type VehicleLookupErrorStatus = 'not-found' | 'error';

/** Map API failures into existing purchase / PWA lookup UI branches only. */
export function mapVehicleLookupApiError(error: unknown): VehicleLookupErrorStatus {
  const normalized = normalizeApiError(error);

  if (
    normalized.status === 404 ||
    normalized.code === 'validation' ||
    normalized.status === 400 ||
    normalized.status === 422
  ) {
    return 'not-found';
  }

  if (normalized.code === 'offline' || normalized.code === 'timeout' || normalized.code === 'network') {
    return 'error';
  }

  if (normalized.code === 'rate_limit' || normalized.code === 'server_error') {
    return 'error';
  }

  if (normalized.status === 503) {
    return 'error';
  }

  return 'error';
}

export type VehicleLoadError = {
  code: 'unavailable' | 'network' | 'server';
  message: string;
};

/** Map vehicle detail/list API failures for post-payment sync. */
export function mapVehicleApiError(error: unknown): VehicleLoadError {
  const normalized = normalizeApiError(error);
  const message = resolveUserFacingMessage(error);

  if (normalized.code === 'offline' || normalized.code === 'timeout' || normalized.code === 'network') {
    return { code: 'network', message };
  }

  if (normalized.code === 'server_error' || normalized.status === 503) {
    return { code: 'server', message };
  }

  return { code: 'unavailable', message };
}
