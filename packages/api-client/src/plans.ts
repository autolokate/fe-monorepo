import type { ApiClient } from './client.js';
import { endpoints } from './endpoints.js';
import { unwrapEnvelope } from './envelope.js';

export type ApiPlanTier = 'SAFE' | 'SECURE' | 'SHIELD' | 'SHIELD_PLUS';

export type PlanPeriod = 'YEARLY';

export type RiderOptionDto = {
  riderCount: number;
  pricePaise: number;
  originalPricePaise: number;
  discountPercent: number;
};

/** Plan catalog row from GET /v1/plans. */
export type PlanOptionDto = {
  tier: ApiPlanTier;
  name: string;
  pricePaise: number;
  period: PlanPeriod;
  riderEligible: boolean;
  features: string[];
  badge: string | null;
  includesLabel: string | null;
  riderOptions: RiderOptionDto[];
};

/** GET /v1/plans — list currently-effective plans (one per tier). */
export async function listPlans(
  client: ApiClient,
  tier?: ApiPlanTier,
): Promise<PlanOptionDto[]> {
  const query = tier ? `?${new URLSearchParams({ tier }).toString()}` : '';
  const response = await client.get<unknown>(`${endpoints.plans.list}${query}`);
  return unwrapEnvelope(response) as PlanOptionDto[];
}
