'use client';

import { dedupedRequest } from '@/lib/api/dedupe-cache';
import { DEFAULT_PLANS_SKU, getPlans, type Plan } from '@/services/plans';

export type { Plan, PlanRiderOption } from '@/services/plans';
export { DEFAULT_PLANS_SKU } from '@/services/plans';

/**
 * Plans rarely change within a session, so cache the response for 10 minutes.
 * Combined with the request-level dedupe this guarantees the journey hits
 * `GET /v1/plans` at most once per SKU — no matter how many pages/components
 * read it or how often the buyer navigates back to the plan picker.
 */
const PLANS_TTL_MS = 10 * 60_000;

const cacheKey = (sku: string) => `purchase-journey:plans:${sku}`;

/**
 * Fetch the protection plans for a SKU (same endpoint as the legacy flow),
 * shared through the TTL dedupe cache. Only successful responses are cached, so
 * a failed load is always retried on the next call.
 */
export function fetchPlans(sku: string = DEFAULT_PLANS_SKU): Promise<Plan[]> {
  return dedupedRequest(cacheKey(sku), PLANS_TTL_MS, () => getPlans(sku));
}
