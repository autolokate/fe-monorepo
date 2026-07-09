import { journeyPaths } from '../constants';
import { purchaseJourneyPaths } from '../purchase/purchase-routing';

import type { RouteProgressConfig } from './route-progress.types';

/** Figma Consumer · QR Activation + Purchase — no step progress bar on any purchase frame. */
export const purchaseRouteProgressByPath: Record<string, RouteProgressConfig | null> = {
  [purchaseJourneyPaths.vehicleDetails]: null,
  [purchaseJourneyPaths.vehicleLookup]: null,
  [purchaseJourneyPaths.vehicleLookupFailed]: null,
  [purchaseJourneyPaths.vehicleConfirmation]: null,
  [purchaseJourneyPaths.choosePlan]: null,
  [purchaseJourneyPaths.riderCover]: null,
  [purchaseJourneyPaths.orderSummary]: null,
  [purchaseJourneyPaths.orderSummaryPromoApplied]: null,
  [purchaseJourneyPaths.processingPayment]: null,
  [purchaseJourneyPaths.paymentSuccess]: null,
  [purchaseJourneyPaths.paymentFailed]: null,
};

export function getPurchaseRouteProgress(pathname: string): RouteProgressConfig | null {
  const normalized = pathname.replace(/\/+$/, '');
  if (normalized.startsWith(`${journeyPaths.purchase}/`) || normalized === journeyPaths.purchase) {
    return purchaseRouteProgressByPath[normalized] ?? null;
  }
  return null;
}
