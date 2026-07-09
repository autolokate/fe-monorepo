import { clearCheckoutCache } from '@/services/checkout/checkout-cache';
import { clearPlansCache, purchasePlansCatalog } from '@/services/plan/plan-cache';
import { clearResolvedQrCache } from '@/services/qr/qr-cache';
import { clearVehicleLookupCache } from '@/services/vehicle/vehicle-cache';
import { clearPurchaseStorage } from '@/storage/index';

/** Wipe persisted purchase blobs, in-memory caches, and ephemeral checkout state. */
export function resetPurchaseFlowState(): void {
  clearPurchaseStorage();
  clearCheckoutCache();
  clearPlansCache();
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length);
  clearResolvedQrCache();
  clearVehicleLookupCache();
}
