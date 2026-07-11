import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

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
  /** Plan-version id — pass to POST /v1/cart as planId. */
  id: string;
  tier: ApiPlanTier;
  version: string;
  name: string;
  pricePaise: number;
  period: PlanPeriod;
  riderEligible: boolean;
  features: string[];
  badge: string | null;
  includesLabel: string | null;
  riderOptions: RiderOptionDto[];
};

export type ListPlansParams = {
  tier?: ApiPlanTier;
  /** Purchase QR sticker code — scopes plan catalog to the scanned QR. */
  code?: string;
};

/** GET /v1/plans — list currently-effective plans (one per tier). */
export async function listPlans(
  client: ApiClient,
  params?: ListPlansParams,
): Promise<PlanOptionDto[]> {
  const search = new URLSearchParams();
  if (params?.tier) {
    search.set('tier', params.tier);
  }
  const code = params?.code?.trim();
  if (code) {
    search.set('code', code);
  }
  const query = search.toString() ? `?${search.toString()}` : '';
  const response = await client.get<unknown>(`${endpoints.plans.list}${query}`);
  return unwrapEnvelope(response) as PlanOptionDto[];
}
