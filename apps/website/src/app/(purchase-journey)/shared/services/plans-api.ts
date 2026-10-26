'use client';

import { dedupedRequest } from '@/lib/api/dedupe-cache';
import { getPlans, type Plan } from '@/services/plans';

export type { Plan, PlanRiderOption } from '@/services/plans';

/**
 * Plans rarely change within a session, so cache the response for 10 minutes.
 * Combined with the request-level dedupe this guarantees the journey hits
 * `GET /v1/plans` at most once — no matter how many pages/components read it or
 * how often the buyer navigates back to the plan picker.
 */
const PLANS_TTL_MS = 10 * 60_000;

const PLANS_CACHE_KEY = 'purchase-journey:plans';

/**
 * Fetch the protection plans, shared through the TTL dedupe cache. Only
 * successful responses are cached, so a failed load is always retried on the
 * next call.
 */
export function fetchPlans(): Promise<Plan[]> {
  return dedupedRequest(PLANS_CACHE_KEY, PLANS_TTL_MS, () => getPlans());
}
