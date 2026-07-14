import {
  buildPurchasePaths,
  decodeRegistrationFromPath,
  parsePurchaseVehicleConfirmationPath,
  parsePurchaseVehicleLookupPath,
  stripOnboardingPrefix,
} from '../routing/journey-url-routing';

/** Canonical URL segments for the purchase journey (relative to onboarding base). */
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

export const PURCHASE_ROUTE_PATTERNS = {
  vehicleLookup: 'vehicle/:registrationNumber/lookup',
  vehicleConfirmation: 'vehicle/:registrationNumber/confirmation',
} as const;

export const LEGACY_PURCHASE_FLAT_SEGMENTS = {
  vehicleLookup: 'vehicle-lookup',
  vehicleConfirmation: 'vehicle-confirmation',
} as const;

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

export { buildPurchasePaths };

export function purchaseVehicleLookupPath(journeyId: string, registration: string): string {
  return buildPurchasePaths(journeyId).vehicleLookup(registration);
}

export function purchaseVehicleConfirmationPath(journeyId: string, registration: string): string {
  return buildPurchasePaths(journeyId).vehicleConfirmation(registration);
}

export { decodeRegistrationFromPath as decodeRegistrationFromPath };

export function purchaseJourneyPathsFor(journeyId: string) {
  const paths = buildPurchasePaths(journeyId);
  return {
    vehicleDetails: paths.vehicleDetails,
    vehicleLookupFailed: paths.vehicleLookupFailed,
    choosePlan: paths.choosePlan,
    riderCover: paths.riderCover,
    orderSummary: paths.orderSummary,
    orderSummaryPromoApplied: paths.orderSummaryPromoApplied,
    orderSummaryInvalidPromo: paths.orderSummaryInvalidPromo,
    processingPayment: paths.processingPayment,
    paymentStillConfirming: paths.paymentStillConfirming,
    paymentSuccess: paths.paymentSuccess,
    paymentFailed: paths.paymentFailed,
    paymentUnconfirmed: paths.paymentUnconfirmed,
  } as const;
}

/** @deprecated Use purchaseJourneyPathsFor(journeyId) */
export const purchaseJourneyPaths = purchaseJourneyPathsFor('');

export const legacyPurchasePathRedirects = (journeyId: string) => {
  const paths = purchaseJourneyPathsFor(journeyId);
  return [
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r03Vehicle, paths.vehicleDetails],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04Fetching, `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleLookup}`],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r04bFetchFailed, paths.vehicleLookupFailed],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r05Confirm, `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleConfirmation}`],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r06ChoosePlan, paths.choosePlan],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r07RiderCover, paths.riderCover],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08OrderSummary, paths.orderSummary],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08bPromoApplied, paths.orderSummaryPromoApplied],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r08cInvalidPromo, paths.orderSummaryInvalidPromo],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r09ProcessingPayment, paths.processingPayment],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r09bStillConfirming, paths.paymentStillConfirming],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10PaymentSuccess, paths.paymentSuccess],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10bPaymentFailed, paths.paymentFailed],
    [LEGACY_PURCHASE_ROUTE_SEGMENTS.r10cPaymentUnconfirmed, paths.paymentUnconfirmed],
  ] as const;
};

export const legacyJourneyPurchasePathRedirects = (journeyId: string) => {
  const paths = purchaseJourneyPathsFor(journeyId);
  return [
    ['vehicle-details', paths.vehicleDetails],
    ['vehicle-lookup', `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleLookup}`],
    ['vehicle-lookup-failed', paths.vehicleLookupFailed],
    ['vehicle-confirmation', `/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleConfirmation}`],
    ['choose-plan', paths.choosePlan],
    ['rider-cover', paths.riderCover],
    ['order-summary', paths.orderSummary],
    ['order-summary-promo-applied', paths.orderSummaryPromoApplied],
    ['order-summary-invalid-promo', paths.orderSummaryInvalidPromo],
    ['processing-payment', paths.processingPayment],
    ['payment-still-confirming', paths.paymentStillConfirming],
    ['payment-success', paths.paymentSuccess],
    ['payment-failed', paths.paymentFailed],
    ['payment-unconfirmed', paths.paymentUnconfirmed],
  ] as const;
};

export type PurchaseJourneyPath = ReturnType<typeof purchaseJourneyPathsFor>[keyof ReturnType<typeof purchaseJourneyPathsFor>];

export function purchaseStepPathSequence(journeyId: string) {
  const paths = purchaseJourneyPathsFor(journeyId);
  return [
    paths.vehicleDetails,
    paths.choosePlan,
    paths.riderCover,
    paths.orderSummary,
    paths.processingPayment,
    paths.paymentSuccess,
  ] as const;
}

export function isPurchaseRoutePath(pathname: string): boolean {
  const relative = stripOnboardingPrefix(pathname);
  const normalized = relative.replace(/\/+$/, '') || '/';
  const segments = Object.values(PURCHASE_ROUTE_SEGMENTS).map((s) => `/${s}`);
  if (segments.includes(normalized)) {
    return true;
  }
  return (
    parsePurchaseVehicleLookupPath(pathname) !== null ||
    parsePurchaseVehicleConfirmationPath(pathname) !== null
  );
}

export function getNextPurchasePath(journeyId: string, currentPath: string): string | null {
  const relative = stripOnboardingPrefix(currentPath);
  const normalized = relative.replace(/\/+$/, '');
  if (parsePurchaseVehicleConfirmationPath(currentPath)) {
    return purchaseJourneyPathsFor(journeyId).choosePlan;
  }
  if (parsePurchaseVehicleLookupPath(currentPath)) {
    return null;
  }

  const sequence = purchaseStepPathSequence(journeyId);
  const paths = purchaseJourneyPathsFor(journeyId);
  const flatPaths = Object.values(paths);
  const index = flatPaths.findIndex((p) => p.endsWith(normalized));
  if (index < 0 || index >= sequence.length - 1) {
    return null;
  }
  return sequence[index + 1] ?? null;
}

export function getPrevPurchasePath(journeyId: string, currentPath: string): string | null {
  const relative = stripOnboardingPrefix(currentPath);
  const normalized = relative.replace(/\/+$/, '');
  if (parsePurchaseVehicleConfirmationPath(currentPath)) {
    return purchaseJourneyPathsFor(journeyId).vehicleDetails;
  }

  const sequence = purchaseStepPathSequence(journeyId);
  const index = sequence.findIndex((p) => p === currentPath || p.endsWith(normalized));
  if (index <= 0) {
    return null;
  }
  return sequence[index - 1] ?? null;
}

export { parsePurchaseVehicleLookupPath, parsePurchaseVehicleConfirmationPath };
