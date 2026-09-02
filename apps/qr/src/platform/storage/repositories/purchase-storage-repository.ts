import {
  clearAttachResult,
  clearCheckout,
  getAttachResult,
  getCheckout,
  getVehicle,
  patchVehicle,
  saveAttachResult,
  saveCheckout,
  saveVehicle,
  type StoredAttachResult,
  type StoredCheckout,
  type StoredVehicle,
} from '@/storage/index';

/** Read/write purchase journey blobs (vehicle, attach, checkout). */
export const purchaseStorageRepository = {
  readVehicle(): StoredVehicle | null {
    return getVehicle();
  },

  writeVehicle(vehicle: StoredVehicle): StoredVehicle {
    return saveVehicle(vehicle);
  },

  patchVehicle(patch: Partial<StoredVehicle>): StoredVehicle | null {
    return patchVehicle(patch);
  },

  readAttachResult(): StoredAttachResult | null {
    return getAttachResult();
  },

  writeAttachResult(result: Omit<StoredAttachResult, 'attachedAt'>): StoredAttachResult {
    return saveAttachResult(result);
  },

  clearAttachResult(): void {
    clearAttachResult();
  },

  readCheckout(): StoredCheckout | null {
    return getCheckout();
  },

  writeCheckout(checkout: StoredCheckout): StoredCheckout {
    return saveCheckout(checkout);
  },

  clearCheckout(): void {
    clearCheckout();
  },
};
