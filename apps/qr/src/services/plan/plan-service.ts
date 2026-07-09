import { listPlans as listPlansApi } from '@autolokate/api-client';

import type { PurchasePlanDefinition, PurchasePlanId } from '@/features/qr-purchase/types-checkout';
import { getQrApiClient } from '@/platform/api/qr-api-client';

import {
  clearInflightPlansLoad,
  getInflightPlansLoad,
  getPlansRevision,
  peekPlansCatalog,
  purchasePlansCatalog,
  rememberPlansCatalog,
  setInflightPlansLoad,
} from './plan-cache';
import { mapPlanApiError, type PlanLoadError } from './plan-errors';
import {
  mapPlanOptionToDefinition,
  PURCHASE_PLAN_ORDER,
  sortPlansByCarouselOrder,
} from './plan-mapper';
import { planLogger } from './plan-logger';

export type LoadPlansResult =
  | { ok: true; plans: PurchasePlanDefinition[] }
  | { ok: false; error: PlanLoadError };

export const DEFAULT_PURCHASE_PLAN_ID: PurchasePlanId = 'secure';

function buildPlaceholderCatalog(): PurchasePlanDefinition[] {
  return PURCHASE_PLAN_ORDER.map((id) => {
    const existing = purchasePlansCatalog.find((plan) => plan.id === id);
    if (existing) {
      return existing;
    }
    return {
      id,
      name: id === 'shield-plus' ? 'Shield+' : id.charAt(0).toUpperCase() + id.slice(1),
      priceLabel: '—',
      priceInr: 0,
      pricePaise: 0,
      features: [],
      riderEligible: false,
      riderOptions: [],
    };
  });
}

async function fetchPlansFromApi(): Promise<PurchasePlanDefinition[]> {
  const client = getQrApiClient();
  const options = await listPlansApi(client);
  const mapped = sortPlansByCarouselOrder(options.map(mapPlanOptionToDefinition));
  rememberPlansCatalog(mapped);
  planLogger.info('plans_loaded', { count: mapped.length });
  return mapped;
}

/** Load plan catalog from GET /v1/plans (cached 5 min, deduped). */
export async function loadPlans(): Promise<LoadPlansResult> {
  const cached = peekPlansCatalog();
  if (cached) {
    planLogger.debug('plans_cache_hit', { count: cached.length });
    return { ok: true, plans: cached };
  }

  const inflight = getInflightPlansLoad();
  if (inflight) {
    planLogger.debug('plans_load_deduped');
    try {
      const plans = await inflight;
      return { ok: true, plans };
    } catch (error) {
      return { ok: false, error: mapPlanApiError(error) };
    }
  }

  const promise = fetchPlansFromApi();
  setInflightPlansLoad(promise);

  try {
    const plans = await promise;
    return { ok: true, plans };
  } catch (error) {
    planLogger.warn('plans_load_failed', { error });
    return { ok: false, error: mapPlanApiError(error) };
  } finally {
    clearInflightPlansLoad();
  }
}

/** Idempotent prefetch used by purchase routes before R06. */
export async function ensurePlansLoaded(): Promise<LoadPlansResult> {
  return loadPlans();
}

export function getPurchasePlansCatalog(): readonly PurchasePlanDefinition[] {
  return peekPlansCatalog() ?? purchasePlansCatalog;
}

export function getPurchasePlanById(planId: PurchasePlanId): PurchasePlanDefinition {
  const catalog = getPurchasePlansCatalog();
  const plan = catalog.find((entry) => entry.id === planId);
  if (plan) {
    return plan;
  }
  const fallback = catalog.find((entry) => entry.id === DEFAULT_PURCHASE_PLAN_ID);
  if (fallback) {
    return fallback;
  }
  const placeholders = buildPlaceholderCatalog();
  const placeholder = placeholders.find((entry) => entry.id === planId) ?? placeholders[1];
  if (!placeholder) {
    throw new Error('Default purchase plan missing from catalog');
  }
  return placeholder;
}

export { getPlansRevision, purchasePlansCatalog };
