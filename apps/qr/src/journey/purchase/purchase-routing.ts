import { compactPlate } from '@/services/vehicle/vehicle-plate';
import { normalizePlate } from '@/services/vehicle/index';

/** Canonical URL segments for the purchase journey (root-level paths). */
export const PURCHASE_ROUTE_SEGMENTS = {
  vehicleDetails: 'vehicle',
  vehicleLookupFailed: 'vehicle-lookup-failed',
  choosePlan: 'plans',
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

/** Parametric purchase routes — registration number is a path segment. */
export const PURCHASE_ROUTE_PATTERNS = {
  vehicleLookup: '/vehicle/:registrationNumber/lookup',
  vehicleConfirmation: '/vehicle/:registrationNumber/confirmation',
} as const;

/** Legacy flat segments — redirect only. */
export const LEGACY_PURCHASE_FLAT_SEGMENTS = {
  vehicleLookup: 'vehicle-lookup',
  vehicleConfirmation: 'vehicle-confirmation',
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

function purchasePath(segment: string): string {
  return `/${segment}`;
}

function registrationPathSegment(registration: string): string {
  const compact = compactPlate(normalizePlate(registration));
  return encodeURIComponent(compact);
}

/** `/vehicle/:registrationNumber/lookup` */
export function purchaseVehicleLookupPath(registration: string): string {
  return `/vehicle/${registrationPathSegment(registration)}/lookup`;
}

/** `/vehicle/:registrationNumber/confirmation` */
export function purchaseVehicleConfirmationPath(registration: string): string {
  return `/vehicle/${registrationPathSegment(registration)}/confirmation`;
}

export function decodeRegistrationFromPath(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return segment.trim();
  }
}

const VEHICLE_LOOKUP_PATH_RE = /^\/vehicle\/([^/]+)\/lookup$/;
const VEHICLE_CONFIRMATION_PATH_RE = /^\/vehicle\/([^/]+)\/confirmation$/;

export function parsePurchaseVehicleLookupPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '');
  const match = VEHICLE_LOOKUP_PATH_RE.exec(normalized);
  if (!match?.[1]) {
    return null;
  }
  return decodeRegistrationFromPath(match[1]);
}

export function parsePurchaseVehicleConfirmationPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '');
  const match = VEHICLE_CONFIRMATION_PATH_RE.exec(normalized);
  if (!match?.[1]) {
    return null;
  }
  return decodeRegistrationFromPath(match[1]);
}

/** URL paths for the purchase segment (root-level, no `/journey` prefix). */
export const purchaseJourneyPaths = {
  vehicleDetails: purchasePath(PURCHASE_ROUTE_SEGMENTS.vehicleDetails),
  vehicleLookupFailed: purchasePath(PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed),
  choosePlan: purchasePath(PURCHASE_ROUTE_SEGMENTS.choosePlan),
  riderCover: purchasePath(PURCHASE_ROUTE_SEGMENTS.riderCover),
  orderSummary: purchasePath(PURCHASE_ROUTE_SEGMENTS.orderSummary),
  orderSummaryPromoApplied: purchasePath(PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied),
  orderSummaryInvalidPromo: purchasePath(PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo),
  processingPayment: purchasePath(PURCHASE_ROUTE_SEGMENTS.processingPayment),
  paymentStillConfirming: purchasePath(PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming),
  paymentSuccess: purchasePath(PURCHASE_ROUTE_SEGMENTS.paymentSuccess),
  paymentFailed: purchasePath(PURCHASE_ROUTE_SEGMENTS.paymentFailed),
  paymentUnconfirmed: purchasePath(PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed),
} as const;

/** Maps legacy path segments to their canonical replacements. */
export const legacyPurchasePathRedirects = [
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r03Vehicle, purchaseJourneyPaths.vehicleDetails],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04Fetching, `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleLookup}`],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04bFetchFailed, purchaseJourneyPaths.vehicleLookupFailed],
  [LEGACY_PURCHASE_ROUTE_SEGMENTS.r05Confirm, `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleConfirmation}`],
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

/** Old `/journey/purchase/*` segments → canonical root paths. */
export const legacyJourneyPurchasePathRedirects = [
  ['vehicle-details', purchaseJourneyPaths.vehicleDetails],
  ['vehicle-lookup', `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleLookup}`],
  ['vehicle-lookup-failed', purchaseJourneyPaths.vehicleLookupFailed],
  ['vehicle-confirmation', `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleConfirmation}`],
  ['choose-plan', purchaseJourneyPaths.choosePlan],
  ['rider-cover', purchaseJourneyPaths.riderCover],
  ['order-summary', purchaseJourneyPaths.orderSummary],
  ['order-summary-promo-applied', purchaseJourneyPaths.orderSummaryPromoApplied],
  ['order-summary-invalid-promo', purchaseJourneyPaths.orderSummaryInvalidPromo],
  ['processing-payment', purchaseJourneyPaths.processingPayment],
  ['payment-still-confirming', purchaseJourneyPaths.paymentStillConfirming],
  ['payment-success', purchaseJourneyPaths.paymentSuccess],
  ['payment-failed', purchaseJourneyPaths.paymentFailed],
  ['payment-unconfirmed', purchaseJourneyPaths.paymentUnconfirmed],
] as const;

export type PurchaseJourneyPath = (typeof purchaseJourneyPaths)[keyof typeof purchaseJourneyPaths];

/** Active purchase journey — Auth → checkout → Emergency handoff on payment success. */
export const purchaseStepPathSequence = [
  purchaseJourneyPaths.vehicleDetails,
  purchaseJourneyPaths.choosePlan,
  purchaseJourneyPaths.riderCover,
  purchaseJourneyPaths.orderSummary,
  purchaseJourneyPaths.processingPayment,
  purchaseJourneyPaths.paymentSuccess,
] as const;

export const purchaseRoutePaths = Object.values(purchaseJourneyPaths);

export function isPurchaseRoutePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '');
  if ((purchaseRoutePaths as readonly string[]).includes(normalized)) {
    return true;
  }
  return (
    parsePurchaseVehicleLookupPath(normalized) !== null ||
    parsePurchaseVehicleConfirmationPath(normalized) !== null
  );
}

export function getNextPurchasePath(currentPath: string): string | null {
  const normalized = currentPath.replace(/\/+$/, '');
  if (parsePurchaseVehicleConfirmationPath(normalized)) {
    return purchaseJourneyPaths.choosePlan;
  }
  if (parsePurchaseVehicleLookupPath(normalized)) {
    return null;
  }

  const index = (purchaseStepPathSequence as readonly string[]).indexOf(normalized);
  if (index < 0 || index >= purchaseStepPathSequence.length - 1) {
    return null;
  }
  return purchaseStepPathSequence[index + 1] ?? null;
}

export function getPrevPurchasePath(currentPath: string): string | null {
  const normalized = currentPath.replace(/\/+$/, '');
  if (parsePurchaseVehicleConfirmationPath(normalized)) {
    return purchaseJourneyPaths.vehicleDetails;
  }

  const index = (purchaseStepPathSequence as readonly string[]).indexOf(normalized);
  if (index <= 0) {
    return null;
  }
  return purchaseStepPathSequence[index - 1] ?? null;
}
