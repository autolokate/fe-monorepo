import type { PurchasePlanDefinition } from '@/features/qr-purchase/types-checkout';

const CACHE_TTL_MS = 5 * 60_000;

type CacheState = {
  plans: PurchasePlanDefinition[];
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

export function peekPlansCatalog(): PurchasePlanDefinition[] | null {
  if (!cache || cache.expiresAt <= Date.now()) {
    return null;
  }
  return cache.plans;
}

export function rememberPlansCatalog(plans: PurchasePlanDefinition[]): void {
  const revision = (cache?.revision ?? 0) + 1;
  cache = {
    plans,
    expiresAt: Date.now() + CACHE_TTL_MS,
    revision,
  };
  purchasePlansCatalog.splice(0, purchasePlansCatalog.length, ...plans);
}

export function clearPlansCache(): void {
  cache = null;
  inflight = null;
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
