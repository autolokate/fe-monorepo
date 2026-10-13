'use client';

import { DEFAULT_PLANS_SKU, getCachedPlans, type Plan } from '@/services/plans';

export type { Plan, PlanRiderOption } from '@/services/plans';
export { DEFAULT_PLANS_SKU } from '@/services/plans';

/**
 * Fetch the protection plans for a SKU (same endpoint as the legacy flow),
 * shared through the 10-minute TTL cache with Home and Pricing. Only successful
 * responses are cached, so a failed load is always retried on the next call.
 */
export function fetchPlans(sku: string = DEFAULT_PLANS_SKU): Promise<Plan[]> {
  return getCachedPlans(sku);
}
