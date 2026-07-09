import { clearCheckoutCache } from '@/services/checkout/checkout-cache.js';
import { clearPlansCache, purchasePlansCatalog } from '@/services/plan/plan-cache.js';
import { clearResolvedQrCache } from '@/services/qr/qr-cache.js';
import { clearVehicleLookupCache } from '@/services/vehicle/vehicle-cache.js';
import { clearPurchaseStorage } from '@/storage/index.js';

/** Wipe persisted purchase blobs, in-memory caches, and ephemeral checkout state. */
export function resetPurchaseFlowState(): void {
  clearPurchaseStorage();
  clearCheckoutCache();
  clearPlansCache();
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length);
  clearResolvedQrCache();
  clearVehicleLookupCache();
}
