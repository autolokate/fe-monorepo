import type {
  CreatePlanBody,
  CreateSkuBody,
  UpdatePlanFeaturesBody,
  UpdateSkuBody,
} from '@autolokate/api-client';

import type {
  CreatePlanVersionFormValues,
  CreateSkuFormValues,
  PlanFeaturesFormValues,
  UpdateSkuFormValues,
} from '@/features/catalog/catalog-schemas';
import { rupeesToPaise } from '@/services/catalog/catalog-money';

/** The schema already proved this parses; a stray `null` here would be a programming error, not input. */
function requirePaise(rupees: string): number {
  return rupeesToPaise(rupees) ?? 0;
}

export function toCreatePlanBody(values: CreatePlanVersionFormValues): CreatePlanBody {
  const effectiveFrom = values.effectiveFrom.trim();
  return {
    tier: values.tier,
    name: values.name,
    pricePaise: requirePaise(values.priceRupees),
    riderEligible: values.riderEligible,
    period: 'YEARLY',
    ...(effectiveFrom.length > 0
      ? { effectiveFrom: new Date(effectiveFrom).toISOString() }
      : {}),
    ...(values.retireCurrent ? { retireCurrent: true } : {}),
  };
}

export function toUpdatePlanFeaturesBody(values: PlanFeaturesFormValues): UpdatePlanFeaturesBody {
  const badge = values.badge.trim();
  const includesLabel = values.includesLabel.trim();
  return {
    features: values.features.map((feature) => feature.value.trim()),
    badge: badge.length > 0 ? badge : null,
    includesLabel: includesLabel.length > 0 ? includesLabel : null,
  };
}

/** `defaultPlanVersion` is absent on purpose — the server derives it from `defaultPlanId`. */
export function toCreateSkuBody(values: CreateSkuFormValues): CreateSkuBody {
  const sponsorOrgId = values.sponsorOrgId.trim();
  return {
    skuCode: values.skuCode,
    channel: values.channel,
    defaultPlanId: values.defaultPlanId,
    offeredTiers: values.offeredTiers,
    listPricePaise: requirePaise(values.listPriceRupees),
    prepaid: values.prepaid,
    riderDefault: values.riderDefault,
    active: values.active,
    ...(sponsorOrgId.length > 0 ? { sponsorOrgId } : {}),
  };
}

export function toUpdateSkuBody(values: UpdateSkuFormValues): UpdateSkuBody {
  return {
    defaultPlanId: values.defaultPlanId,
    offeredTiers: values.offeredTiers,
    listPricePaise: requirePaise(values.listPriceRupees),
    riderDefault: values.riderDefault,
    active: values.active,
  };
}
