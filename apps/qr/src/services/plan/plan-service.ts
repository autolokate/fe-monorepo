import { listPlans as listPlansApi } from '@autolokate/api-client';

import type { PurchasePlanDefinition, PurchasePlanId } from '@/features/qr-purchase/types-checkout';
import { getQrApiClient } from '@/platform/api/qr-api-client';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { resolveQrCode } from '@/services/qr/qr-service';

import {
  clearInflightPlansLoad,
  clearPlansCache as clearPlansCacheInternal,
  getInflightPlansLoad,
  getPlansRevision,
  invalidatePlansCache,
  peekPlansCatalog,
  purchasePlansCatalog,
  rememberPlansCatalog,
  setInflightPlansLoad,
} from './plan-cache';
import { mapPlanApiError, type PlanLoadError } from './plan-errors';
import { mapPlanOptionsToDefinitions } from './plan-mapper';
import { planLogger } from './plan-logger';

export type LoadPlansResult =
  | { ok: true; plans: PurchasePlanDefinition[] }
  | { ok: false; error: PlanLoadError };

export type LoadPlansOptions = {
  /** Bypass TTL cache and refetch from the API (still coalesces concurrent callers). */
  force?: boolean;
};

export const DEFAULT_PURCHASE_PLAN_ID: PurchasePlanId = 'secure';

/** Coalesce concurrent loadPlans callers (hydration + route + StrictMode). */
let inflightLoadResult: Promise<LoadPlansResult> | null = null;

/** Empty catalog when API data is unavailable — never invent prices/features. */
function emptyCatalogFallback(planId: PurchasePlanId): PurchasePlanDefinition {
  return {
    id: planId,
    planVersionId: '',
    name: '',
    priceLabel: '',
    priceInr: 0,
    pricePaise: 0,
    features: [],
    riderEligible: false,
    riderOptions: [],
  };
}

async function ensureQrResolved(qrCode: string | null): Promise<void> {
  if (!qrCode) {
    return;
  }
  const resolved = qrStorageRepository.readResolved();
  if (resolved?.qrCode === qrCode) {
    return;
  }
  await resolveQrCode(qrCode);
}

async function fetchPlanCatalog(): Promise<PurchasePlanDefinition[]> {
  const options = await listPlansApi(getQrApiClient());
  return mapPlanOptionsToDefinitions(options);
}

/**
 * Load the plan catalog for purchase via GET /v1/plans (one effective plan per tier).
 * Concurrent callers (hydration, rider-cover, StrictMode) share one in-flight request.
 */
export async function loadPlans(options: LoadPlansOptions = {}): Promise<LoadPlansResult> {
  const qrCode = resolvePurchaseQrCode();
  if (!qrCode) {
    planLogger.warn('plans_load_blocked', { reason: 'missing_purchase_qr_code' });
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing purchase QR code.' },
    };
  }

  await ensureQrResolved(qrCode);

  if (!options.force) {
    const cached = peekPlansCatalog(qrCode);
    if (cached) {
      planLogger.debug('plans_cache_hit', { count: cached.length, qrCode });
      return { ok: true, plans: cached };
    }
  } else {
    invalidatePlansCache();
  }

  if (inflightLoadResult) {
    planLogger.debug('plans_load_deduped');
    return inflightLoadResult;
  }

  const existingPlansInflight = getInflightPlansLoad();
  if (existingPlansInflight) {
    planLogger.debug('plans_load_deduped');
    inflightLoadResult = existingPlansInflight
      .then((plans): LoadPlansResult => ({ ok: true, plans }))
      .catch((error: unknown) => ({ ok: false as const, error: mapPlanApiError(error) }))
      .finally(() => {
        inflightLoadResult = null;
      });
    return inflightLoadResult;
  }

  const fetchPromise = (async () => {
    const plans = await fetchPlanCatalog();
    rememberPlansCatalog(plans, qrCode, 'catalog');
    planLogger.info('plans_loaded', { count: plans.length, qrCode });
    return plans;
  })();

  setInflightPlansLoad(fetchPromise);

  inflightLoadResult = (async (): Promise<LoadPlansResult> => {
    try {
      const plans = await fetchPromise;
      return { ok: true, plans };
    } catch (error) {
      planLogger.warn('plans_load_failed', { error, qrCode });
      return { ok: false, error: mapPlanApiError(error) };
    } finally {
      clearInflightPlansLoad();
      inflightLoadResult = null;
    }
  })();

  return inflightLoadResult;
}

/** Idempotent prefetch used by purchase routes before R06. */
export async function ensurePlansLoaded(options?: LoadPlansOptions): Promise<LoadPlansResult> {
  return loadPlans(options);
}

export function getPurchasePlansCatalog(): readonly PurchasePlanDefinition[] {
  return peekPlansCatalog(resolvePurchaseQrCode()) ?? purchasePlansCatalog;
}

export function clearPurchasePlansState(): void {
  inflightLoadResult = null;
  clearPlansCacheInternal();
}

export function getPurchasePlanById(planId: PurchasePlanId): PurchasePlanDefinition {
  const catalog = getPurchasePlansCatalog();
  const plan = catalog.find((entry) => entry.id === planId);
  if (plan) {
    return plan;
  }
  const fallback = catalog[0];
  if (fallback) {
    return fallback;
  }
  return emptyCatalogFallback(planId);
}

export { getPlansRevision, purchasePlansCatalog };
