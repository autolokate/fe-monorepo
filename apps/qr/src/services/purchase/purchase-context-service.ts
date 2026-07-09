import type { AlVehicleRcField } from '@autolokate/ui';

import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout.js';
import type { AuthLanguageId } from '@/features/shared-auth/types.js';
import { normalizePlate } from '@/services/vehicle/index.js';
import { getVehicle, patchVehicle, saveVehicle, type StoredVehicle } from '@/storage/index.js';

export type PersistVehicleContextInput = {
  registration: string;
  fields?: AlVehicleRcField[];
  ownerName?: string;
  languageId?: AuthLanguageId;
  profileId?: string;
  selectedPlanId?: PurchasePlanId;
  riderCount?: PurchaseRiderCount;
};

/** Persist confirmed vehicle and auth context for later checkout and attach. */
export function persistVehicleContext(input: PersistVehicleContextInput): StoredVehicle {
  return saveVehicle({
    registration: normalizePlate(input.registration),
    fields: input.fields,
    ownerName: input.ownerName,
    languageId: input.languageId,
    profileId: input.profileId,
    selectedPlanId: input.selectedPlanId,
    riderCount: input.riderCount,
    confirmedAt: new Date().toISOString(),
  });
}

export function persistPurchaseSelections(selections: {
  selectedPlanId?: PurchasePlanId;
  riderCount?: PurchaseRiderCount;
}): void {
  patchVehicle(selections);
}

export function peekStoredRegistration(): string | null {
  return getVehicle()?.registration ?? null;
}
