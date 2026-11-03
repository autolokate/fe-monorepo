import {
  getAdminTaxiFleetVehicle,
  listAdminTaxiFleetVehicles,
  listAdminTaxiRefunds,
  removeAdminTaxiFleetMedia,
  retryAdminTaxiRefund,
  type AdminTaxiFleetVehicleDetailDto,
  type AdminTaxiFleetVehicleDto,
  type AdminTaxiRefundQueueDto,
  type AdminTaxiRefundStatus,
  type AdminV4Page,
  type ListAdminTaxiFleetQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

function opts(signal?: AbortSignal) {
  return signal ? { signal } : {};
}

/** GET /admin/v1/taxi/vehicles — fleet cards (flow v3). */
export function fetchTaxiFleetPage(
  query: ListAdminTaxiFleetQuery,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminTaxiFleetVehicleDto>> {
  return listAdminTaxiFleetVehicles(getAdminApiClient(), query, opts(signal));
}

/** GET /admin/v1/taxi/vehicles/{id} — card + signed media URLs (300 s). */
export function fetchTaxiFleetVehicle(
  id: string,
  signal?: AbortSignal,
): Promise<AdminTaxiFleetVehicleDetailDto> {
  return getAdminTaxiFleetVehicle(getAdminApiClient(), id, opts(signal));
}

/** POST …/media/{mediaId}/remove — audited take-down of one slot. */
export function submitTaxiFleetMediaRemove(
  id: string,
  mediaId: string,
  reason: string,
): Promise<AdminTaxiFleetVehicleDetailDto> {
  return removeAdminTaxiFleetMedia(getAdminApiClient(), id, mediaId, { reason });
}

/** GET /admin/v1/taxi/refunds — default (no status) = FAILED + NEEDS_RECONCILIATION. */
export function fetchTaxiRefundsPage(
  query: { status?: AdminTaxiRefundStatus; limit?: number; cursor?: string },
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminTaxiRefundQueueDto>> {
  return listAdminTaxiRefunds(getAdminApiClient(), query, opts(signal));
}

/** POST /admin/v1/taxi/refunds/{id}/retry — Idempotency-Key + reason. */
export function submitTaxiRefundRetry(
  id: string,
  reason: string,
  idempotencyKey: string,
): Promise<AdminTaxiRefundQueueDto> {
  return retryAdminTaxiRefund(getAdminApiClient(), id, { reason }, idempotencyKey);
}
