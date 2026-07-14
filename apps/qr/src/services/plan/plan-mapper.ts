import type {
  ActivationPlansDto,
  ApiPlanTier,
  FundedPlanDto,
  UpgradeOptionDto,
} from '@autolokate/api-client';
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

/** True when the selected plan is the already-funded row from activation/plans. */
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

function mapFundedPlanToDefinition(funded: FundedPlanDto): PurchasePlanDefinition {
  const id = mapApiTierToPurchasePlanId(funded.tier);
  const included = funded.payablePaise <= 0;
  return {
    id,
    planVersionId: funded.planId,
    name: funded.name,
    priceLabel: included ? 'Included' : formatYearlyPriceLabel(funded.pricePaise),
    priceInr: pricePaiseToInr(funded.pricePaise),
    pricePaise: funded.pricePaise,
    payablePaise: funded.payablePaise,
    included: true,
    badge: funded.badge ?? null,
    includesLabel: funded.includesLabel ?? null,
    features: funded.features,
    riderEligible: funded.riderEligible,
    riderOptions: [],
    tall: id === 'secure',
  };
}

function mapUpgradeRiderOption(
  rider: UpgradeOptionDto['riderOptions'][number],
): PurchaseRiderOption | null {
  if (rider.riderCount !== 1 && rider.riderCount !== 2) {
    return null;
  }
  const pricePaise = rider.payablePaise;
  const discountPercent = rider.discountPercent;
  // Activation quotes only expose payable + discount; derive strike when discount > 0.
  const originalPricePaise =
    discountPercent > 0 && discountPercent < 100
      ? Math.round(pricePaise / (1 - discountPercent / 100))
      : pricePaise;
  return {
    riderCount: rider.riderCount,
    pricePaise,
    originalPricePaise,
    discountPercent,
  };
}

function mapUpgradeOptionToDefinition(option: UpgradeOptionDto): PurchasePlanDefinition {
  const id = mapApiTierToPurchasePlanId(option.tier);
  const riderOptions: PurchaseRiderOption[] = option.riderOptions
    .map(mapUpgradeRiderOption)
    .filter((r): r is PurchaseRiderOption => r !== null);

  return {
    id,
    planVersionId: option.planId,
    name: option.name,
    priceLabel: formatYearlyPriceLabel(option.payablePaise),
    priceInr: pricePaiseToInr(option.payablePaise),
    pricePaise: option.payablePaise,
    payablePaise: option.payablePaise,
    included: false,
    badge: option.badge ?? null,
    includesLabel: option.includesLabel ?? null,
    features: option.features,
    riderEligible: option.riderEligible,
    riderOptions,
    tall: id === 'secure',
  };
}

/** Map GET /v1/activation/plans into the R06 carousel catalog. */
export function mapActivationPlansToDefinitions(
  plans: ActivationPlansDto,
): PurchasePlanDefinition[] {
  const funded = mapFundedPlanToDefinition(plans.funded);
  const upgrades = plans.options.map(mapUpgradeOptionToDefinition);
  const byId = new Map<PurchasePlanId, PurchasePlanDefinition>();
  byId.set(funded.id, funded);
  for (const upgrade of upgrades) {
    byId.set(upgrade.id, upgrade);
  }
  return sortPlansByCarouselOrder([...byId.values()]);
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
