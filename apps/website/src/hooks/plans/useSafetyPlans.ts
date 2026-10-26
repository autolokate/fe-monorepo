'use client';

import { useApiQuery } from '@/hooks/useApiQuery';
import { getPlans } from '@/services/plans';

/**
 * Reactive list of protection plans. Seeds with an empty list so the carousel
 * can render a placeholder.
 */
export function useSafetyPlans() {
  return useApiQuery(() => getPlans(), [], { initialData: [] });
}
