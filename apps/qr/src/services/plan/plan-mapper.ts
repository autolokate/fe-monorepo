import type { ApiPlanTier, PlanOptionDto } from '@autolokate/api-client';
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

function mapRiderOptions(option: PlanOptionDto): readonly PurchaseRiderOption[] {
  return option.riderOptions
    .filter((r): r is PurchaseRiderOption => r.riderCount === 1 || r.riderCount === 2)
    .map((r) => ({
      riderCount: r.riderCount,
      pricePaise: r.pricePaise,
      originalPricePaise: r.originalPricePaise,
      discountPercent: r.discountPercent,
    }));
}

export function mapPlanOptionToDefinition(option: PlanOptionDto): PurchasePlanDefinition {
  const id = mapApiTierToPurchasePlanId(option.tier);
  const priceInr = pricePaiseToInr(option.pricePaise);

  return {
    id,
    planVersionId: option.id,
    name: option.name,
    priceLabel: formatYearlyPriceLabel(option.pricePaise),
    priceInr,
    pricePaise: option.pricePaise,
    badge: option.badge,
    includesLabel: option.includesLabel,
    features: option.features,
    riderEligible: option.riderEligible,
    riderOptions: mapRiderOptions(option),
    addon: option.riderEligible ? { label: 'Rider cover · up to 2 · add-on' } : undefined,
    tall: id === 'secure',
  };
}

export function sortPlansByCarouselOrder(plans: PurchasePlanDefinition[]): PurchasePlanDefinition[] {
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
  const versionId = plan?.planVersionId?.trim();
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
