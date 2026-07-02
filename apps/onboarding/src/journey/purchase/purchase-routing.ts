import { journeyPaths } from '../constants.js';

/** Canonical URL segments for the purchase journey. */
export const PURCHASE_ROUTE_SEGMENTS = {
  vehicleDetails: 'vehicle-details',
  vehicleLookup: 'vehicle-lookup',
  vehicleLookupFailed: 'vehicle-lookup-failed',
  vehicleConfirmation: 'vehicle-confirmation',
  choosePlan: 'choose-plan',
  riderCover: 'rider-cover',
  orderSummary: 'order-summary',
  orderSummaryPromoApplied: 'order-summary-promo-applied',
  orderSummaryInvalidPromo: 'order-summary-invalid-promo',
  processingPayment: 'processing-payment',
  paymentStillConfirming: 'payment-still-confirming',
  paymentSuccess: 'payment-success',
  paymentFailed: 'payment-failed',
  paymentUnconfirmed: 'payment-unconfirmed',
} as const;

/** Legacy Figma R03–R10 segments — kept for deep-link redirects only. */
export const LEGACY_PURCHASE_ROUTE_SEGMENTS = {
  r03Vehicle: 'r03-vehicle',
  r04Fetching: 'r04-fetching',
  r04bFetchFailed: 'r04b-fetch-failed',
  r05Confirm: 'r05-confirm',
  r06ChoosePlan: 'r06-choose-plan',
  r07RiderCover: 'r07-rider-cover',
  r08OrderSummary: 'r08-order-summary',
  r08bPromoApplied: 'r08b-promo-applied',
  r08cInvalidPromo: 'r08c-invalid-promo',
  r09ProcessingPayment: 'r09-processing-payment',
  r09bStillConfirming: 'r09b-still-confirming',
  r10PaymentSuccess: 'r10-payment-success',
  r10bPaymentFailed: 'r10b-payment-failed',
  r10cPaymentUnconfirmed: 'r10c-payment-unconfirmed',
} as const;

const purchaseBase = journeyPaths.purchase;

/** URL paths for the purchase segment inside the journey orchestrator. */
export const purchaseJourneyPaths = {
  vehicleDetails: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.vehicleDetails}`,
  vehicleLookup: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.vehicleLookup}`,
  vehicleLookupFailed: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed}`,
  vehicleConfirmation: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.vehicleConfirmation}`,
  choosePlan: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.choosePlan}`,
  riderCover: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.riderCover}`,
  orderSummary: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.orderSummary}`,
  orderSummaryPromoApplied: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied}`,
  orderSummaryInvalidPromo: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo}`,
  processingPayment: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.processingPayment}`,
  paymentStillConfirming: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming}`,
  paymentSuccess: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.paymentSuccess}`,
  paymentFailed: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.paymentFailed}`,
  paymentUnconfirmed: `${purchaseBase}/${PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed}`,
} as const;

/** Maps legacy path segments to their canonical replacements. */
export const legacyPurchasePathRedirects = [
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r03Vehicle, purchaseJourneyPaths.vehicleDetails],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04Fetching, purchaseJourneyPaths.vehicleLookup],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04bFetchFailed, purchaseJourneyPaths.vehicleLookupFailed],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r05Confirm, purchaseJourneyPaths.vehicleConfirmation],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r06ChoosePlan, purchaseJourneyPaths.choosePlan],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r07RiderCover, purchaseJourneyPaths.riderCover],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08OrderSummary, purchaseJourneyPaths.orderSummary],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08bPromoApplied, purchaseJourneyPaths.orderSummaryPromoApplied],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08cInvalidPromo, purchaseJourneyPaths.orderSummaryInvalidPromo],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r09ProcessingPayment, purchaseJourneyPaths.processingPayment],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r09bStillConfirming, purchaseJourneyPaths.paymentStillConfirming],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10PaymentSuccess, purchaseJourneyPaths.paymentSuccess],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10bPaymentFailed, purchaseJourneyPaths.paymentFailed],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10cPaymentUnconfirmed, purchaseJourneyPaths.paymentUnconfirmed],
] as const;

export type PurchaseJourneyPath = (typeof purchaseStepPathSequence)[number];

/** Active purchase journey — Auth → checkout → Emergency handoff on payment success. */
export const purchaseStepPathSequence = [
  purchaseJourneyPaths.vehicleDetails,
  purchaseJourneyPaths.vehicleLookup,
  purchaseJourneyPaths.vehicleConfirmation,
  purchaseJourneyPaths.choosePlan,
  purchaseJourneyPaths.riderCover,
  purchaseJourneyPaths.orderSummary,
  purchaseJourneyPaths.processingPayment,
  purchaseJourneyPaths.paymentSuccess,
] as const;

export function getNextPurchasePath(currentPath: string): string | null {
  const index = purchaseStepPathSequence.indexOf(currentPath as PurchaseJourneyPath);
  if (index < 0 || index >= purchaseStepPathSequence.length - 1) {
    return null;
  }
  return purchaseStepPathSequence[index + 1] ?? null;
}

export function getPrevPurchasePath(currentPath: string): string | null {
  const index = purchaseStepPathSequence.indexOf(currentPath as PurchaseJourneyPath);
  if (index <= 0) {
    return null;
  }
  return purchaseStepPathSequence[index - 1] ?? null;
}
