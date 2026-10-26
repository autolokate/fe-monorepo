import type { ApiPlanTier, PlanOptionDto, RiderOptionDto } from '@autolokate/api-client';
import { formatInrFromPaise } from '@autolokate/utils';

import type {
  PurchasePlanDefinition,
  PurchasePlanId,
  PurchaseRiderOption,
} from '@/features/qr-purchase/types-checkout';

/** Canonical carousel order — matches Figma R06. */
export const PURCHASE_PLAN_ORDER: readonly PurchasePlanId[] = [
  'safe',
  'secure',
  'shield',
  'shield-plus',
];

const API_TIER_BY_PLAN_ID: Record<PurchasePlanId, ApiPlanTier> = {
  safe: 'SAFE',
  secure: 'SECURE',
  shield: 'SHIELD',
  'shield-plus': 'SHIELD_PLUS',
};

const PLAN_ID_BY_API_TIER: Record<ApiPlanTier, PurchasePlanId> = {
  SAFE: 'safe',
  SECURE: 'secure',
  SHIELD: 'shield',
  SHIELD_PLUS: 'shield-plus',
};

export function mapPurchasePlanIdToApiTier(planId: PurchasePlanId): ApiPlanTier {
  return API_TIER_BY_PLAN_ID[planId];
}

export function mapApiTierToPurchasePlanId(tier: ApiPlanTier): PurchasePlanId {
  return PLAN_ID_BY_API_TIER[tier];
}

export function formatYearlyPriceLabel(pricePaise: number): string {
  return `${formatInrFromPaise(pricePaise)}/yr`;
}

export function pricePaiseToInr(pricePaise: number): number {
  return Math.round(pricePaise / 100);
}

/** True when the selected plan row is already included on this QR (nothing payable). */
export function isIncludedActivationPlan(
  plans: readonly PurchasePlanDefinition[],
  planId: PurchasePlanId,
): boolean {
  const plan = plans.find((entry) => entry.id === planId);
  if (!plan) {
    return false;
  }
  if (plan.included === true) {
    return true;
  }
  return typeof plan.payablePaise === 'number' && plan.payablePaise <= 0;
}

function normalizePlanCount(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(0, Math.floor(value));
}

function mapRiderOption(rider: RiderOptionDto): PurchaseRiderOption | null {
  if (rider.riderCount !== 1 && rider.riderCount !== 2) {
    return null;
  }
  return {
    riderCount: rider.riderCount,
    pricePaise: rider.pricePaise,
    originalPricePaise: rider.originalPricePaise,
    discountPercent: rider.discountPercent,
  };
}

function mapPlanOptionToDefinition(option: PlanOptionDto): PurchasePlanDefinition {
  const id = mapApiTierToPurchasePlanId(option.tier);
  const riderOptions = option.riderOptions
    .map(mapRiderOption)
    .filter((r): r is PurchaseRiderOption => r !== null);

  return {
    id,
    planVersionId: option.id,
    name: option.name,
    priceLabel: formatYearlyPriceLabel(option.pricePaise),
    priceInr: pricePaiseToInr(option.pricePaise),
    pricePaise: option.pricePaise,
    payablePaise: option.pricePaise,
    included: false,
    badge: option.badge ?? null,
    includesLabel: option.includesLabel ?? null,
    features: option.features,
    riderEligible: option.riderEligible,
    riderCount: normalizePlanCount(option.riderCount),
    emergencyCount: normalizePlanCount(option.emergencyCount),
    riderOptions,
    tall: id === 'secure',
  };
}

/** Map GET /v1/plans (one currently-effective plan per tier) into the R06 carousel catalog. */
export function mapPlanOptionsToDefinitions(
  options: readonly PlanOptionDto[],
): PurchasePlanDefinition[] {
  const byId = new Map<PurchasePlanId, PurchasePlanDefinition>();
  for (const option of options) {
    if (option.tier in PLAN_ID_BY_API_TIER) {
      byId.set(mapApiTierToPurchasePlanId(option.tier), mapPlanOptionToDefinition(option));
    }
  }
  return sortPlansByCarouselOrder([...byId.values()]);
}

export function sortPlansByCarouselOrder(
  plans: PurchasePlanDefinition[],
): PurchasePlanDefinition[] {
  return [...plans].sort(
    (left, right) => PURCHASE_PLAN_ORDER.indexOf(left.id) - PURCHASE_PLAN_ORDER.indexOf(right.id),
  );
}

export function formatApiTierLabel(tier: string): string {
  return tier
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getPlanVersionId(
  plans: readonly PurchasePlanDefinition[],
  planId: PurchasePlanId,
): string | null {
  const plan = plans.find((entry) => entry.id === planId);
  const versionId = plan?.planVersionId.trim();
  return versionId ? versionId : null;
}

/** Rider options for the selected plan tier from the cached catalog. */
export function getRiderOptionsForPlan(
  plans: readonly PurchasePlanDefinition[],
  planId: PurchasePlanId,
): readonly PurchaseRiderOption[] {
  const plan = plans.find((entry) => entry.id === planId);
  return plan?.riderOptions ?? [];
}

export function isPlanRiderEligible(
  plans: readonly PurchasePlanDefinition[],
  planId: PurchasePlanId,
): boolean {
  const plan = plans.find((entry) => entry.id === planId);
  return plan?.riderEligible ?? false;
}
