import type { QrResolution } from '@autolokate/api-client';

import { loadJourneyState } from '@/journey/persistence';
import {
  purchaseJourneyPathsFor,
  purchaseVehicleConfirmationPath,
} from '@/journey/purchase/purchase-routing';
import { buildQrEntryPath, parseJourneyIdFromPathname } from '@/journey/routing/journey-url-routing';
import type { JourneySession } from '@/journey/types';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { getVehicle } from '@/storage/index';
import {
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
} from '@/platform/qr/qr-status';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';

export const PURCHASE_JOURNEY_KIND = {
  FULL_ACTIVATION: 'full_activation',
  RESUME_CHECKOUT: 'resume_checkout',
} as const;

export type PurchaseJourneyKind = (typeof PURCHASE_JOURNEY_KIND)[keyof typeof PURCHASE_JOURNEY_KIND];

export const PURCHASE_ROUTE_ID = {
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

export type PurchaseRouteId = (typeof PURCHASE_ROUTE_ID)[keyof typeof PURCHASE_ROUTE_ID];

const VEHICLE_STEP_ROUTE_IDS = new Set<PurchaseRouteId>([
  PURCHASE_ROUTE_ID.vehicleDetails,
  PURCHASE_ROUTE_ID.vehicleLookup,
  PURCHASE_ROUTE_ID.vehicleLookupFailed,
  PURCHASE_ROUTE_ID.vehicleConfirmation,
]);

const CHECKOUT_ROUTE_IDS = new Set<PurchaseRouteId>([
  PURCHASE_ROUTE_ID.choosePlan,
  PURCHASE_ROUTE_ID.riderCover,
  PURCHASE_ROUTE_ID.orderSummary,
  PURCHASE_ROUTE_ID.orderSummaryPromoApplied,
  PURCHASE_ROUTE_ID.orderSummaryInvalidPromo,
]);

export type PurchaseJourneyState = {
  kind: PurchaseJourneyKind;
  entryPath: string;
  skipsVehicleSteps: boolean;
  skipsAttachApi: boolean;
  hasStoredResolve: boolean;
  qrCode: string | null;
};

export type PurchaseRouteAccess = {
  allowed: boolean;
  redirectTo: string | null;
};

/** Derive purchase journey mode from the stored QR resolve snapshot. */
export function readPurchaseJourneyState(
  searchParams?: URLSearchParams,
  journeyId?: string | null,
): PurchaseJourneyState {
  const stored = qrStorageRepository.readResolved();
  const skipsVehicleSteps = Boolean(stored && isAttachedQrLifecycleStatus(stored.qrStatus));
  const resolvedJourneyId =
    journeyId?.trim() ||
    resolvePurchaseQrCode(searchParams) ||
    stored?.qrCode ||
    null;
  const paths = resolvedJourneyId ? purchaseJourneyPathsFor(resolvedJourneyId) : purchaseJourneyPathsFor('_');

  return {
    kind: skipsVehicleSteps
      ? PURCHASE_JOURNEY_KIND.RESUME_CHECKOUT
      : PURCHASE_JOURNEY_KIND.FULL_ACTIVATION,
    entryPath: skipsVehicleSteps ? paths.choosePlan : paths.vehicleDetails,
    skipsVehicleSteps,
    skipsAttachApi: skipsVehicleSteps,
    hasStoredResolve: Boolean(stored),
    qrCode: resolvedJourneyId,
  };
}

/** First purchase screen after shared auth completes. */
export function resolvePurchaseEntryPath(
  searchParams?: URLSearchParams,
  journeyId?: string | null,
): string {
  return readPurchaseJourneyState(searchParams, journeyId).entryPath;
}

export function isVehiclePurchaseStepBlocked(searchParams?: URLSearchParams): boolean {
  return readPurchaseJourneyState(searchParams).skipsVehicleSteps;
}

/** Vehicle confirm on R05 unlocks checkout — attach API success/failure must never block. */
function isVehicleConfirmedForCheckout(session: JourneySession): boolean {
  if (session.vehicle?.confirmed) {
    return true;
  }
  if (getVehicle()?.confirmedAt) {
    return true;
  }
  return Boolean(loadJourneyState().session.vehicle?.confirmed);
}

/**
 * True when checkout screens are reachable.
 * ATTACHED: stored resolve is sufficient — attach API must not run again.
 * DISTRIBUTED: vehicle confirmed on R05 — attach is attempted but non-blocking on failure.
 */
export function isPurchaseCheckoutUnlocked(
  session: JourneySession,
  searchParams?: URLSearchParams,
): boolean {
  const state = readPurchaseJourneyState(searchParams);

  if (state.skipsAttachApi && state.hasStoredResolve) {
    return true;
  }

  return isVehicleConfirmedForCheckout(session);
}

function checkoutFallbackPath(
  routeId: PurchaseRouteId,
  state: PurchaseJourneyState,
  session: JourneySession,
): string {
  const journeyId = state.qrCode ?? '_';
  const paths = purchaseJourneyPathsFor(journeyId);

  if (state.skipsVehicleSteps) {
    return journeyId !== '_' ? buildQrEntryPath(journeyId) : '/q';
  }
  if (routeId === PURCHASE_ROUTE_ID.choosePlan) {
    const registration = session.vehicle?.plate ?? getVehicle()?.registration;
    if (registration?.trim()) {
      return purchaseVehicleConfirmationPath(journeyId, registration);
    }
    return paths.vehicleDetails;
  }
  return paths.choosePlan;
}

/** Central gate for purchase route segments. */
export function evaluatePurchaseRouteAccess(
  routeId: PurchaseRouteId,
  session: JourneySession,
  searchParams?: URLSearchParams,
  journeyId?: string | null,
): PurchaseRouteAccess {
  const state = readPurchaseJourneyState(searchParams, journeyId);
  const paths = purchaseJourneyPathsFor(state.qrCode ?? journeyId ?? '_');

  if (state.skipsVehicleSteps && VEHICLE_STEP_ROUTE_IDS.has(routeId)) {
    return { allowed: false, redirectTo: paths.choosePlan };
  }

  if (CHECKOUT_ROUTE_IDS.has(routeId)) {
    const hasPlanSelection =
      Boolean(session.purchase?.selectedPlanId) ||
      Boolean(getVehicle()?.selectedPlanId);

    if (!hasPlanSelection && routeId !== PURCHASE_ROUTE_ID.choosePlan) {
      return { allowed: false, redirectTo: paths.choosePlan };
    }

    if (isPurchaseCheckoutUnlocked(session, searchParams)) {
      return { allowed: true, redirectTo: null };
    }

    return { allowed: false, redirectTo: checkoutFallbackPath(routeId, state, session) };
  }

  if (routeId === PURCHASE_ROUTE_ID.vehicleConfirmation && state.skipsAttachApi) {
    return { allowed: false, redirectTo: paths.choosePlan };
  }

  return { allowed: true, redirectTo: null };
}

export function isPostActivationQrResolution(resolution: QrResolution): boolean {
  return isActivatedQrLifecycleStatus(resolution.qrStatus) && Boolean(resolution.vehicle?.plate);
}

export function isConsumerPurchaseQrStatus(status: QrResolution['qrStatus']): boolean {
  return isDistributedQrLifecycleStatus(status) || isAttachedQrLifecycleStatus(status);
}
