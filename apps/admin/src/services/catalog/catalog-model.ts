import type { AdminPlanDto, ApiPlanTier, SkuSummaryDto } from '@autolokate/api-client';

import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';

export const PLAN_TIERS = [
  'SAFE',
  'SECURE',
  'SHIELD',
  'SHIELD_PLUS',
] as const satisfies readonly ApiPlanTier[];

const TIER_LABELS: Record<ApiPlanTier, string> = {
  SAFE: 'SAFE',
  SECURE: 'SECURE',
  SHIELD: 'SHIELD',
  SHIELD_PLUS: 'SHIELD PLUS',
};

export function planTierLabel(tier: ApiPlanTier): string {
  return TIER_LABELS[tier];
}

/** A version's place in its tier's history — derived purely from the server's `isEffectiveNow` + window. */
export type PlanLifecycle = 'LIVE' | 'SCHEDULED' | 'RETIRED' | 'DRAFT';

export function getPlanLifecycle(plan: AdminPlanDto, now: number = Date.now()): PlanLifecycle {
  if (plan.isEffectiveNow) {
    return 'LIVE';
  }
  if (plan.effectiveTo !== null && Date.parse(plan.effectiveTo) <= now) {
    return 'RETIRED';
  }
  if (plan.effectiveFrom !== null && Date.parse(plan.effectiveFrom) > now) {
    return 'SCHEDULED';
  }
  // No window opened yet — minted but never published.
  return 'DRAFT';
}

/** The plan versions a Sku may actually sell against today. */
export function getEffectivePlans(plans: readonly AdminPlanDto[]): AdminPlanDto[] {
  return plans.filter((plan) => plan.isEffectiveNow);
}

/**
 * The tiers a shelf may legitimately name. A tier with no effective plan cannot be priced, so offering it
 * would put an unsellable tier on the shelf.
 */
export function getTiersWithEffectivePlan(plans: readonly AdminPlanDto[]): ApiPlanTier[] {
  const tiers = new Set(getEffectivePlans(plans).map((plan) => plan.tier));
  return PLAN_TIERS.filter((tier) => tiers.has(tier));
}

export function indexPlansById(plans: readonly AdminPlanDto[]): Map<string, AdminPlanDto> {
  return new Map(plans.map((plan) => [plan.id, plan]));
}

/** `SHIELD PLUS v3 · ₹1,999` — enough to disambiguate two versions of the same tier in a picker. */
export function formatPlanOptionLabel(plan: AdminPlanDto): string {
  return `${planTierLabel(plan.tier)} v${String(plan.version)} · ${plan.name} · ${formatPaiseAsRupees(plan.pricePaise)}`;
}

export function formatPlanRef(plan: AdminPlanDto): string {
  return `${planTierLabel(plan.tier)} v${String(plan.version)}`;
}

export function formatEffectiveWindow(plan: AdminPlanDto): string {
  const from =
    plan.effectiveFrom !== null
      ? new Date(plan.effectiveFrom).toLocaleDateString()
      : 'Not published';
  const to = plan.effectiveTo !== null ? new Date(plan.effectiveTo).toLocaleDateString() : 'Open';
  return `${from} → ${to}`;
}

export type CatalogMetrics = {
  planVersions: number;
  livePlans: number;
  skus: number;
  emptyShelves: number;
};

export function computeCatalogMetrics(
  plans: readonly AdminPlanDto[],
  skus: readonly SkuSummaryDto[],
): CatalogMetrics {
  return {
    planVersions: plans.length,
    livePlans: plans.filter((plan) => plan.isEffectiveNow).length,
    skus: skus.length,
    emptyShelves: skus.filter((sku) => sku.offeredTiers.length === 0).length,
  };
}
