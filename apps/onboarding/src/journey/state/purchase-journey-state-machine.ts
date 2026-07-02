import type { QrResolution } from '@autolokate/api-client';

import { purchaseJourneyPaths } from '@/journey/purchase/purchase-routing.js';
import { journeyPaths } from '@/journey/constants.js';
import type { JourneySession } from '@/journey/types.js';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code.js';
import {
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
} from '@/platform/qr/qr-status.js';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository.js';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository.js';
import { compactPlate } from '@/services/vehicle/vehicle-plate.js';

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
export function readPurchaseJourneyState(searchParams?: URLSearchParams): PurchaseJourneyState {
  const stored = qrStorageRepository.readResolved();
  const skipsVehicleSteps = Boolean(stored && isAttachedQrLifecycleStatus(stored.qrStatus));

  return {
    kind: skipsVehicleSteps
      ? PURCHASE_JOURNEY_KIND.RESUME_CHECKOUT
      : PURCHASE_JOURNEY_KIND.FULL_ACTIVATION,
    entryPath: skipsVehicleSteps
      ? purchaseJourneyPaths.choosePlan
      : purchaseJourneyPaths.vehicleDetails,
    skipsVehicleSteps,
    skipsAttachApi: skipsVehicleSteps,
    hasStoredResolve: Boolean(stored),
    qrCode: resolvePurchaseQrCode(searchParams) ?? stored?.qrCode ?? null,
  };
}

/** First purchase screen after shared auth completes. */
export function resolvePurchaseEntryPath(searchParams?: URLSearchParams): string {
  return readPurchaseJourneyState(searchParams).entryPath;
}

export function isVehiclePurchaseStepBlocked(searchParams?: URLSearchParams): boolean {
  return readPurchaseJourneyState(searchParams).skipsVehicleSteps;
}

/**
 * True when checkout screens are reachable.
 * ATTACHED: stored resolve is sufficient — attach API must not run again.
 * DISTRIBUTED: vehicle confirmed and POST /attach succeeded for current QR + plate.
 */
export function isPurchaseCheckoutUnlocked(
  session: JourneySession,
  searchParams?: URLSearchParams,
): boolean {
  const state = readPurchaseJourneyState(searchParams);
  if (!state.hasStoredResolve || !state.qrCode) {
    return false;
  }

  const stored = qrStorageRepository.readResolved();
  if (!stored || stored.qrCode !== state.qrCode) {
    return false;
  }

  if (state.skipsAttachApi) {
    return stored.qrCode === state.qrCode;
  }

  if (!session.vehicle?.confirmed) {
    return false;
  }

  return isDistributedAttachComplete(state.qrCode, session);
}

function isDistributedAttachComplete(qrCode: string, session: JourneySession): boolean {
  const registration =
    purchaseStorageRepository.readVehicle()?.registration ?? session.vehicle?.plate?.trim() ?? null;
  if (!registration) {
    return false;
  }

  const compactRegistration = compactPlate(registration);
  if (compactRegistration.length < 5) {
    return false;
  }

  const attach = purchaseStorageRepository.readAttachResult();
  if (!attach?.vehicleId || attach.purchaseQrCode !== qrCode) {
    return false;
  }

  return compactPlate(attach.registration) === compactRegistration;
}

function checkoutFallbackPath(_routeId: PurchaseRouteId, state: PurchaseJourneyState): string {
  if (state.skipsVehicleSteps) {
    return journeyPaths.root;
  }
  return purchaseJourneyPaths.vehicleConfirmation;
}

/** Central gate for purchase route segments. */
export function evaluatePurchaseRouteAccess(
  routeId: PurchaseRouteId,
  session: JourneySession,
  searchParams?: URLSearchParams,
): PurchaseRouteAccess {
  const state = readPurchaseJourneyState(searchParams);

  if (state.skipsVehicleSteps && VEHICLE_STEP_ROUTE_IDS.has(routeId)) {
    return { allowed: false, redirectTo: purchaseJourneyPaths.choosePlan };
  }

  if (CHECKOUT_ROUTE_IDS.has(routeId)) {
    if (
      routeId === PURCHASE_ROUTE_ID.choosePlan &&
      state.skipsAttachApi &&
      state.hasStoredResolve
    ) {
      return { allowed: true, redirectTo: null };
    }

    if (!session.purchase?.selectedPlanId && routeId !== PURCHASE_ROUTE_ID.choosePlan) {
      return { allowed: false, redirectTo: purchaseJourneyPaths.choosePlan };
    }

    if (isPurchaseCheckoutUnlocked(session, searchParams)) {
      return { allowed: true, redirectTo: null };
    }

    return { allowed: false, redirectTo: checkoutFallbackPath(routeId, state) };
  }

  if (routeId === PURCHASE_ROUTE_ID.vehicleConfirmation && state.skipsAttachApi) {
    return { allowed: false, redirectTo: purchaseJourneyPaths.choosePlan };
  }

  return { allowed: true, redirectTo: null };
}

export function isPostActivationQrResolution(resolution: QrResolution): boolean {
  return isActivatedQrLifecycleStatus(resolution.qrStatus) && Boolean(resolution.vehicle?.plate);
}

export function isConsumerPurchaseQrStatus(status: QrResolution['qrStatus']): boolean {
  return isDistributedQrLifecycleStatus(status) || isAttachedQrLifecycleStatus(status);
}
