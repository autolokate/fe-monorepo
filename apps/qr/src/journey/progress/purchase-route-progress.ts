import { purchaseJourneyPathsFor, isPurchaseRoutePath } from '../purchase/purchase-routing';

import type { RouteProgressConfig } from './route-progress.types';

const NO_PROGRESS: RouteProgressConfig | null = null;

// Journey-agnostic ('') purchase paths — identical to the former deprecated alias, without the symbol.
const purchasePaths = purchaseJourneyPathsFor('');

const STATIC_PURCHASE_PROGRESS: Record<string, RouteProgressConfig | null> = {
  [purchasePaths.vehicleDetails]: NO_PROGRESS,
  [purchasePaths.vehicleLookupFailed]: NO_PROGRESS,
  [purchasePaths.choosePlan]: NO_PROGRESS,
  [purchasePaths.riderCover]: NO_PROGRESS,
  [purchasePaths.orderSummary]: NO_PROGRESS,
  [purchasePaths.orderSummaryPromoApplied]: NO_PROGRESS,
  [purchasePaths.processingPayment]: NO_PROGRESS,
  [purchasePaths.paymentSuccess]: NO_PROGRESS,
  [purchasePaths.paymentFailed]: NO_PROGRESS,
};

export const purchaseRouteProgressByPath = STATIC_PURCHASE_PROGRESS;

/** Figma Consumer · QR Activation + Purchase — no step progress bar on any purchase frame. */
export function getPurchaseRouteProgress(pathname: string): RouteProgressConfig | null {
  const normalized = pathname.replace(/\/+$/, '');
  if (!isPurchaseRoutePath(normalized)) {
    return null;
  }
  if (normalized in STATIC_PURCHASE_PROGRESS) {
    return STATIC_PURCHASE_PROGRESS[normalized] ?? null;
  }
  return NO_PROGRESS;
}
