import type { StoredQrResolve } from '@/storage/index';
import type { QrResolution } from '@autolokate/api-client';

import type { JourneySession } from '@/journey/types';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository';
import { normalizePlate } from '@/services/vehicle/index';
import { getFundedPurchasePlanId } from '@/services/plan/plan-service';

import { mapQrPublicVehicleToFields } from './map-qr-public-vehicle-fields';

function toQrResolution(stored: StoredQrResolve): QrResolution {
  return {
    qrStatus: stored.qrStatus,
    channel: stored.channel,
    journey: stored.journey,
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

  const fundedPlanId = getFundedPurchasePlanId() ?? undefined;
  purchaseStorageRepository.writeVehicle({
    registration: normalizePlate(plate),
    fields,
    ...(fundedPlanId ? { selectedPlanId: fundedPlanId } : {}),
    riderCount: 0,
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
  const fundedPlanId = getFundedPurchasePlanId();

  return {
    vehicle: {
      plate: plate ? normalizePlate(plate) : undefined,
      fields,
      fetchStatus: 'success',
      confirmed: true,
    },
    purchase: {
      ...(fundedPlanId ? { selectedPlanId: fundedPlanId } : {}),
      riderCount: 0,
      promoApplied: false,
      promoCode: null,
      promoInvalid: false,
      checkoutReady: false,
      paymentStatus: 'idle',
    },
  };
}
