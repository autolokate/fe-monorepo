'use client';

import { useApiQuery } from '@/hooks/useApiQuery';
import { DEFAULT_PLANS_SKU, getCachedPlans } from '@/services/plans';

/**
 * Reactive list of protection plans for a SKU. Public endpoint — no auth.
 * Seeds with an empty list so the carousel can render a placeholder; repeat
 * visits within the cache window resolve without a network call.
 */
export function useSafetyPlans(sku: string = DEFAULT_PLANS_SKU) {
  return useApiQuery(() => getCachedPlans(sku), [sku], { initialData: [] });
}
