import type { PurchasePlanDefinition } from '@/features/qr-purchase/types-checkout';

const CACHE_TTL_MS = 5 * 60_000;

/** Plans in the QR app come only from GET /v1/activation/plans. */
export type PlansCacheSource = 'activation';

type CacheState = {
  qrCode: string | null;
  plans: PurchasePlanDefinition[];
  source: PlansCacheSource;
  expiresAt: number;
  revision: number;
};

let cache: CacheState | null = null;
let inflight: Promise<PurchasePlanDefinition[]> | null = null;

/** Mutable catalog reference consumed by PlanCarousel via purchase-plans re-export. */
export const purchasePlansCatalog: PurchasePlanDefinition[] = [];

export function getPlansRevision(): number {
  return cache?.revision ?? 0;
}

export function peekPlansCatalog(qrCode: string | null): PurchasePlanDefinition[] | null {
  if (!cache || cache.expiresAt <= Date.now()) {
    return null;
  }
  if (cache.qrCode !== qrCode) {
    return null;
  }
  return cache.plans;
}

export function getPlansCacheSource(): PlansCacheSource | null {
  return cache?.source ?? null;
}

export function rememberPlansCatalog(
  plans: PurchasePlanDefinition[],
  qrCode: string | null,
  source: PlansCacheSource = 'activation',
): void {
  const revision = (cache?.revision ?? 0) + 1;
  cache = {
    qrCode,
    plans,
    source,
    expiresAt: Date.now() + CACHE_TTL_MS,
    revision,
  };
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length, ...plans);
}

/** Drop cached plans but keep any in-flight fetch so StrictMode / parallel callers coalesce. */
export function invalidatePlansCache(): void {
  cache = null;
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length);
}

export function clearPlansCache(): void {
  cache = null;
  inflight = null;
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length);
}

export function getInflightPlansLoad(): Promise<PurchasePlanDefinition[]> | null {
  return inflight;
}

export function setInflightPlansLoad(promise: Promise<PurchasePlanDefinition[]>): void {
  inflight = promise;
}

export function clearInflightPlansLoad(): void {
  inflight = null;
}
