import type { StoredQrResolve } from '@/storage/index.js';
import type { QrResolution } from '@autolokate/api-client';

import type { JourneySession } from '@/journey/types.js';
import { DEFAULT_PURCHASE_PLAN_ID } from '@/features/qr-purchase/data/purchase-plans.js';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository.js';
import { normalizePlate } from '@/services/vehicle/index.js';

import { mapQrPublicVehicleToFields } from './map-qr-public-vehicle-fields.js';

function toQrResolution(stored: StoredQrResolve): QrResolution {
  return {
    qrStatus: stored.qrStatus,
    channel: stored.channel,
    journey: stored.journey,
    offeredSku: stored.offeredSku,
    vehicle: stored.vehicle,
  };
}

/** Seed vehicle + attach context when resolve reports an already-attached QR. */
export function seedAttachedPurchaseFromResolve(code: string, resolution: QrResolution): void {
  const vehicle = resolution.vehicle;
  if (!vehicle) {
    return;
  }
  const plate = vehicle.plate.trim();
  if (!plate) {
    return;
  }

  const fields = mapQrPublicVehicleToFields(vehicle);

  purchaseStorageRepository.writeVehicle({
    registration: normalizePlate(plate),
    fields,
    selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
    riderCount: 1,
    confirmedAt: new Date().toISOString(),
  });

  purchaseStorageRepository.writeAttachResult({
    attachEventId: `resolved-${code}`,
    vehicleId: `resolved-${code}`,
    qrStatus: 'ATTACHED',
    subscriptionId: null,
    purchaseQrCode: code.trim(),
    registration: normalizePlate(plate),
  });
}

/** Persist storage + session when auth completes for an ATTACHED QR. */
export function ensureAttachedPurchaseContext(resolved: StoredQrResolve): Partial<JourneySession> {
  seedAttachedPurchaseFromResolve(resolved.qrCode, toQrResolution(resolved));
  return buildAttachedPurchaseSessionPatch(resolved);
}

/** Hydrate journey session after auth when purchase continues from ATTACHED resolve. */
export function buildAttachedPurchaseSessionPatch(
  resolved: StoredQrResolve,
): Partial<JourneySession> {
  const vehicle = resolved.vehicle;
  const plate = vehicle?.plate.trim();
  const fields = vehicle ? mapQrPublicVehicleToFields(vehicle) : undefined;

  return {
    vehicle: {
      plate: plate ? normalizePlate(plate) : undefined,
      fields,
      fetchStatus: 'success',
      confirmed: true,
    },
    purchase: {
      selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
      riderCount: 1,
      promoApplied: false,
      promoCode: null,
      promoInvalid: false,
      checkoutReady: false,
      paymentStatus: 'idle',
    },
  };
}
