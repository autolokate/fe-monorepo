'use client';

import { useApiQuery } from '@/hooks/useApiQuery';
import { getPlans } from '@/services/plans';

/**
 * Reactive list of protection plans for marketing surfaces. `GET /v1/plans` is public,
 * so anonymous visitors see live plans too. Seeds with an empty list so the carousel
 * can render a placeholder.
 */
export function useSafetyPlans() {
  return useApiQuery(() => getPlans(), [], { initialData: [] });
}
