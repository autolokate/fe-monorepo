import { DEFAULT_PURCHASE_PLAN_ID } from '../qr-purchase/data/purchase-plans';
import type { PurchasePlanId, PurchaseRiderCount } from '../qr-purchase/types-checkout';
import { getPurchasePlanById } from '@/services/plan/plan-service';

export type EmergencyPlanLimits = {
  /** Maximum emergency contacts allowed for the purchased plan. */
  maxEmergencyContacts: number;
  /** Minimum required before E5 Continue is enabled. */
  minEmergencyContacts: number;
  /** Product cap for rider slots from the selected plan catalog row. */
  maxRiders: number;
};

export type EmergencyFlowKind = 'purchase' | 'partner';

/** Fallback only when activation/plans did not return emergencyCount. */
const FALLBACK_MAX_EMERGENCY_CONTACTS_BY_PLAN: Record<PurchasePlanId, number> = {
  safe: 1,
  secure: 3,
  shield: 3,
  'shield-plus': 3,
};

const RIDER_ADDON_PRODUCT_CAP = 2;

export function resolvePurchasePlanId(planId: PurchasePlanId | undefined): PurchasePlanId {
  return planId ?? DEFAULT_PURCHASE_PLAN_ID;
}

function readCatalogEmergencyCount(planId: PurchasePlanId): number | null {
  const count = getPurchasePlanById(planId).emergencyCount;
  return typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : null;
}

function readCatalogRiderCount(planId: PurchasePlanId): number {
  const plan = getPurchasePlanById(planId);
  if (typeof plan.riderCount === 'number' && Number.isFinite(plan.riderCount)) {
    return Math.max(0, Math.floor(plan.riderCount));
  }
  if (!plan.riderEligible) {
    return 0;
  }
  return RIDER_ADDON_PRODUCT_CAP;
}

/** Single source of truth for emergency + rider limits — prefers activation/plans counts. */
export function getEmergencyPlanLimits(planId: PurchasePlanId | undefined): EmergencyPlanLimits {
  const resolvedPlanId = resolvePurchasePlanId(planId);
  const maxEmergencyContacts =
    readCatalogEmergencyCount(resolvedPlanId) ??
    FALLBACK_MAX_EMERGENCY_CONTACTS_BY_PLAN[resolvedPlanId];
  const maxRiders = Math.min(RIDER_ADDON_PRODUCT_CAP, readCatalogRiderCount(resolvedPlanId));

  return {
    maxEmergencyContacts,
    minEmergencyContacts: maxEmergencyContacts === 0 ? 0 : 1,
    maxRiders,
  };
}

export function getPurchasedRiderSlots(riderCount: PurchaseRiderCount | undefined): number {
  return riderCount ?? 0;
}

/**
 * Entitled rider slots:
 * - partner: preview.riderCount
 * - purchase: max(plan.riderCount from activation/plans, purchased addon slots)
 */
export function getEntitledRiderSlots(
  planId: PurchasePlanId | undefined,
  riderCount: PurchaseRiderCount | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): number {
  if (flowKind === 'partner') {
    return getPurchasedRiderSlots(riderCount);
  }

  const resolvedPlanId = resolvePurchasePlanId(planId);
  const planRiders = readCatalogRiderCount(resolvedPlanId);
  const purchased = getPurchasedRiderSlots(riderCount);
  return Math.min(RIDER_ADDON_PRODUCT_CAP, Math.max(planRiders, purchased));
}

export function shouldEnterRiderPrompt(
  planId: PurchasePlanId | undefined,
  riderCount: PurchaseRiderCount | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): boolean {
  return getEntitledRiderSlots(planId, riderCount, flowKind) > 0;
}

/** Post-pay emergency contact entry — skip when plan emergencyCount is 0. */
export function shouldEnterEmergencyContacts(planId: PurchasePlanId | undefined): boolean {
  return getEmergencyPlanLimits(planId).maxEmergencyContacts > 0;
}

export function canAddEmergencyContact(
  currentCount: number,
  planId: PurchasePlanId | undefined,
): boolean {
  const { maxEmergencyContacts } = getEmergencyPlanLimits(planId);
  return currentCount < maxEmergencyContacts;
}

export function canAddRider(
  currentRiderCount: number,
  planId: PurchasePlanId | undefined,
  purchasedRiderSlots: PurchaseRiderCount | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): boolean {
  const entitled = getEntitledRiderSlots(planId, purchasedRiderSlots, flowKind);
  return entitled > 0 && currentRiderCount < entitled;
}

/** True when purchased rider slots remain unfilled and user has not skipped R0. */
export function needsRiderSetup(
  planId: PurchasePlanId | undefined,
  purchasedRiderSlots: PurchaseRiderCount | undefined,
  currentRiderCount: number,
  riderSkipped?: boolean,
  flowKind: EmergencyFlowKind = 'purchase',
): boolean {
  if (riderSkipped) {
    return false;
  }
  return canAddRider(currentRiderCount, planId, purchasedRiderSlots, flowKind);
}

/** E5 Continue — rider setup only when slots remain and user has not skipped R0. */
export function getContactsSummaryRiderContext(
  planId: PurchasePlanId | undefined,
  purchasedRiderSlots: PurchaseRiderCount | undefined,
  currentRiderCount: number,
  riderSkipped: boolean | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): {
  ridersOwed: boolean;
  shouldEnterRiderFlowOnContinue: boolean;
} {
  const entitledSlots = getEntitledRiderSlots(planId, purchasedRiderSlots, flowKind);
  const ridersOwed = entitledSlots > 0 && currentRiderCount < entitledSlots;

  return {
    ridersOwed,
    shouldEnterRiderFlowOnContinue: ridersOwed && !riderSkipped,
  };
}

export function getRiderPromptDescription(entitledRiderSlots: number): string {
  if (entitledRiderSlots <= 1) {
    return 'You’ve already paid for 1 rider’s cover. Add their name now, or finish later from your profile.';
  }

  return `You’ve already paid for ${String(entitledRiderSlots)} riders’ cover. Add their names now, or finish later from your profile.`;
}

/** Figma R0 offline — 713:2311 */
export function getRiderPromptOfflineDescription(): string {
  return 'We’ll set this up when you’re back online';
}

export function getContactsMaxReachedMessage(planId: PurchasePlanId | undefined): string {
  const { maxEmergencyContacts } = getEmergencyPlanLimits(planId);
  return `You’ve added the maximum ${String(maxEmergencyContacts)} contacts`;
}

export function getRidersMaxReachedMessage(
  planId: PurchasePlanId | undefined,
  purchasedRiderSlots: PurchaseRiderCount | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): string {
  const entitled = getEntitledRiderSlots(planId, purchasedRiderSlots, flowKind);
  return `You’ve added the maximum ${String(entitled)} riders`;
}

/** Figma 373:37 — E0 empty state description. */
export const E0_CONTACTS_EMPTY_DESCRIPTION =
  'Add 1–3 people we’ll alert if you’re in a crash.';

export function getContactsEmptyDescription(planId: PurchasePlanId | undefined): string {
  const { maxEmergencyContacts } = getEmergencyPlanLimits(planId);

  if (maxEmergencyContacts <= 0) {
    return '';
  }

  if (maxEmergencyContacts === 1) {
    return 'Add 1 person we’ll alert if you’re in a crash.';
  }

  return `Add up to ${String(maxEmergencyContacts)} people we’ll alert if you’re in a crash.`;
}

export function getContactsSummaryDescription(
  currentCount: number,
  planId: PurchasePlanId | undefined,
): string {
  const { maxEmergencyContacts } = getEmergencyPlanLimits(planId);
  const remaining = Math.max(0, maxEmergencyContacts - currentCount);

  if (currentCount >= maxEmergencyContacts) {
    return `${String(maxEmergencyContacts)} of ${String(maxEmergencyContacts)} added · maximum reached`;
  }

  return `${String(currentCount)} of ${String(maxEmergencyContacts)} added · you can add ${String(remaining)} more`;
}

export function getRidersSummaryDescription(
  currentCount: number,
  planId: PurchasePlanId | undefined,
  purchasedRiderSlots: PurchaseRiderCount | undefined,
  flowKind: EmergencyFlowKind = 'purchase',
): string {
  const entitled = getEntitledRiderSlots(planId, purchasedRiderSlots, flowKind);

  if (entitled === 0) {
    return '';
  }

  if (currentCount >= entitled) {
    return `${String(entitled)} of ${String(entitled)} added · maximum reached`;
  }

  const remaining = entitled - currentCount;
  return `${String(currentCount)} of ${String(entitled)} added · you can add ${String(remaining)} more`;
}
