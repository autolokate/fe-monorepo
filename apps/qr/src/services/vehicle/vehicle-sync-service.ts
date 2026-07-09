import type { VehicleSummaryDto } from '@autolokate/api-client';
import { getVehicleById, listVehicles } from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository';
import { compactPlate } from '@/services/vehicle/vehicle-plate';
import type { StoredAttachResult } from '@/storage/index';
import { getAttachResult } from '@/storage/index';

import { mapVehicleApiError, type VehicleLoadError } from './vehicle-errors';
import { vehicleLogger } from './vehicle-logger';

export type SyncVehiclesAfterPaymentResult =
  | { ok: true; vehicleId: string; subscriptionId: string | null }
  | { ok: false; error: VehicleLoadError };

function matchVehicleSummary(
  list: VehicleSummaryDto[],
  attach: StoredAttachResult,
): VehicleSummaryDto | undefined {
  const vehicleId = attach.vehicleId.trim();
  const byId = list.find((vehicle) => vehicle.vehicleId === vehicleId);
  if (byId) {
    return byId;
  }

  const registration = compactPlate(attach.registration);
  if (!registration) {
    return undefined;
  }

  return list.find((vehicle) => compactPlate(vehicle.plate ?? '') === registration);
}

function persistSubscriptionIdFromList(
  attach: StoredAttachResult,
  list: VehicleSummaryDto[],
): string | null {
  let matched = matchVehicleSummary(list, attach);
  if (!matched) {
    const active = list.filter((vehicle) => vehicle.status === 'ACTIVE');
    if (active.length === 1) {
      matched = active[0];
    }
  }
  if (!matched) {
    return null;
  }
  const subscriptionId = matched.subscriptionId.trim();
  if (!subscriptionId || attach.subscriptionId === subscriptionId) {
    return subscriptionId || null;
  }

  purchaseStorageRepository.writeAttachResult({
    attachEventId: attach.attachEventId,
    vehicleId: attach.vehicleId,
    qrStatus: attach.qrStatus,
    subscriptionId,
    purchaseQrCode: attach.purchaseQrCode,
    registration: attach.registration,
  });
  vehicleLogger.info('subscription_id_persisted', { subscriptionId, vehicleId: attach.vehicleId });
  return subscriptionId;
}

/** After payment: load vehicle detail + list, persist subscriptionId for rider APIs. */
export async function tryResolveSubscriptionFromVehicles(): Promise<string | null> {
  const attach = purchaseStorageRepository.readAttachResult();
  if (!attach || !attach.vehicleId.trim()) {
    return null;
  }

  if (attach.subscriptionId?.trim()) {
    return attach.subscriptionId.trim();
  }

  const client = getQrApiClient();
  try {
    const list = await listVehicles(client);
    return persistSubscriptionIdFromList(attach, list);
  } catch (error) {
    vehicleLogger.warn('subscription_resolve_failed', { error, vehicleId: attach.vehicleId });
    return null;
  }
}

/** After payment success: GET /v1/vehicles/{vehicleId} then GET /v1/vehicles. */
export async function syncVehiclesAfterPayment(): Promise<SyncVehiclesAfterPaymentResult> {
  const attach = getAttachResult();
  const vehicleId = attach?.vehicleId.trim() ?? '';
  if (!vehicleId) {
    vehicleLogger.warn('sync_vehicles_skipped', { reason: 'missing_vehicle_id_from_attach' });
    return { ok: false, error: { code: 'unavailable', message: 'Missing vehicle id.' } };
  }

  const client = getQrApiClient();

  try {
    const isSyntheticVehicleId = vehicleId.startsWith('resolved-');
    if (!isSyntheticVehicleId) {
      const detail = await getVehicleById(client, vehicleId);
      vehicleLogger.info('vehicle_detail_loaded', { vehicleId: detail.vehicleId, plate: detail.plate });
    }

    const list = await listVehicles(client);
    vehicleLogger.info('vehicles_list_loaded', { count: list.length });

    const subscriptionId = attach ? persistSubscriptionIdFromList(attach, list) : null;

    return { ok: true, vehicleId, subscriptionId };
  } catch (error) {
    vehicleLogger.warn('sync_vehicles_failed', { error, vehicleId });
    return { ok: false, error: mapVehicleApiError(error) };
  }
}
