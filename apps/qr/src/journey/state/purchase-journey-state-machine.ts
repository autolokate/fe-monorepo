import type { QrResolution } from '@autolokate/api-client';

import { loadJourneyState } from '@/journey/persistence';
import { purchaseJourneyPathsFor } from '@/journey/purchase/purchase-routing';
import type { JourneySession } from '@/journey/types';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { getVehicle } from '@/storage/index';
import {
  isActivatedQrLifecycleStatus,
  isAttachedQrLifecycleStatus,
  isDistributedQrLifecycleStatus,
} from '@/platform/qr/qr-status';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { getFundedPurchasePlanId, getPurchasePlansCatalog } from '@/services/plan/plan-service';

export const PURCHASE_JOURNEY_KIND = {
  FULL_ACTIVATION: 'full_activation',
  RESUME_CHECKOUT: 'resume_checkout',
} as const;

export type PurchaseJourneyKind =
  (typeof PURCHASE_JOURNEY_KIND)[keyof typeof PURCHASE_JOURNEY_KIND];

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

const UPGRADE_CHECKOUT_ROUTE_IDS = new Set<PurchaseRouteId>([
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
    journeyId?.trim() || resolvePurchaseQrCode(searchParams) || stored?.qrCode || null;
  const paths = resolvedJourneyId
    ? purchaseJourneyPathsFor(resolvedJourneyId)
    : purchaseJourneyPathsFor('_');

  return {
    kind: skipsVehicleSteps
      ? PURCHASE_JOURNEY_KIND.RESUME_CHECKOUT
      : PURCHASE_JOURNEY_KIND.FULL_ACTIVATION,
    // Post-auth entry is always plans; skip proceeds to vehicle lookup.
    entryPath: paths.choosePlan,
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

function hasPlanSelection(session: JourneySession): boolean {
  return (
    Boolean(session.purchase?.selectedPlanId) ||
    Boolean(getVehicle()?.selectedPlanId) ||
    Boolean(session.purchase?.skippedPlanUpgrade) ||
    Boolean(session.purchase?.entitlement)
  );
}

/** Vehicle steps unlock after Skip / Continue / Upgrade from the plans screen. */
export function isPurchaseVehicleUnlocked(session: JourneySession): boolean {
  return (
    Boolean(session.purchase?.skippedPlanUpgrade) ||
    Boolean(session.purchase?.upgradeCheckout) ||
    hasPlanSelection(session)
  );
}

/**
 * True when upgrade checkout screens (riders / order summary) are reachable.
 * Requires a confirmed vehicle (or resume-checkout when QR already attached).
 */
export function isPurchaseCheckoutUnlocked(
  session: JourneySession,
  searchParams?: URLSearchParams,
): boolean {
  const state = readPurchaseJourneyState(searchParams);

  if (state.skipsAttachApi && state.hasStoredResolve) {
    return true;
  }

  if (!session.purchase?.upgradeCheckout) {
    return false;
  }

  if (session.vehicle?.confirmed || getVehicle()?.confirmedAt) {
    return true;
  }

  return Boolean(loadJourneyState().session.vehicle?.confirmed);
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
    // Already attached — skip vehicle/attach and stay on plans → emergency path later.
    return { allowed: false, redirectTo: paths.choosePlan };
  }

  // Plans screen is first after auth — always allowed.
  if (routeId === PURCHASE_ROUTE_ID.choosePlan) {
    return { allowed: true, redirectTo: null };
  }

  // Vehicle steps require Skip / Continue / Upgrade from plans.
  if (VEHICLE_STEP_ROUTE_IDS.has(routeId)) {
    if (!isPurchaseVehicleUnlocked(session)) {
      return { allowed: false, redirectTo: paths.choosePlan };
    }
    return { allowed: true, redirectTo: null };
  }

  // Upgrade checkout (riders / order summary) — skip flow never uses these.
  if (UPGRADE_CHECKOUT_ROUTE_IDS.has(routeId)) {
    if (session.purchase?.skippedPlanUpgrade && !state.skipsAttachApi) {
      return { allowed: false, redirectTo: paths.choosePlan };
    }
    if (!hasPlanSelection(session)) {
      return { allowed: false, redirectTo: paths.choosePlan };
    }
    if (isPurchaseCheckoutUnlocked(session, searchParams)) {
      return { allowed: true, redirectTo: null };
    }
    return { allowed: false, redirectTo: paths.vehicleDetails };
  }

  return { allowed: true, redirectTo: null };
}

export function isPostActivationQrResolution(resolution: QrResolution): boolean {
  return isActivatedQrLifecycleStatus(resolution.qrStatus) && Boolean(resolution.vehicle?.plate);
}

export function isConsumerPurchaseQrStatus(status: QrResolution['qrStatus']): boolean {
  return isDistributedQrLifecycleStatus(status) || isAttachedQrLifecycleStatus(status);
}

/**
 * True when the selected plan is already funded on this QR (activation/plans.funded).
 * Derived from API catalog flags — never hardcoded tier names.
 */
export function isCommercePrepaidFreePlan(planId: string): boolean {
  const catalog = getPurchasePlansCatalog();
  const plan = catalog.find((entry) => entry.id === planId);
  if (!plan) {
    return getFundedPurchasePlanId() === planId;
  }
  if (plan.included === true) {
    return true;
  }
  return typeof plan.payablePaise === 'number' && plan.payablePaise <= 0;
}
