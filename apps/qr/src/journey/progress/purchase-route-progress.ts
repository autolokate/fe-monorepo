import { purchaseJourneyPaths, isPurchaseRoutePath } from '../purchase/purchase-routing';

import type { RouteProgressConfig } from './route-progress.types';

const NO_PROGRESS: RouteProgressConfig | null = null;

const STATIC_PURCHASE_PROGRESS: Record<string, RouteProgressConfig | null> = {
  [purchaseJourneyPaths.vehicleDetails]: NO_PROGRESS,
  [purchaseJourneyPaths.vehicleLookupFailed]: NO_PROGRESS,
  [purchaseJourneyPaths.choosePlan]: NO_PROGRESS,
  [purchaseJourneyPaths.riderCover]: NO_PROGRESS,
  [purchaseJourneyPaths.orderSummary]: NO_PROGRESS,
  [purchaseJourneyPaths.orderSummaryPromoApplied]: NO_PROGRESS,
  [purchaseJourneyPaths.processingPayment]: NO_PROGRESS,
  [purchaseJourneyPaths.paymentSuccess]: NO_PROGRESS,
  [purchaseJourneyPaths.paymentFailed]: NO_PROGRESS,
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
