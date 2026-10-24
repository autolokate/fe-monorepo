import {
  getTaxiPolicy,
  listTaxiPolicyHistory,
  publishTaxiPolicy,
  upsertTaxiPolicyDraft,
  type TaxiPolicyAuditDto,
  type TaxiPolicyDto,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** Live Admin Taxi policy — requires OPERATOR + step_up; Nest needs Taxi migrate on target. */
export async function fetchTaxiPolicy(signal?: AbortSignal): Promise<TaxiPolicyDto> {
  return getTaxiPolicy(getAdminApiClient(), { signal });
}

export async function saveTaxiPolicyDraft(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<TaxiPolicyDto> {
  return upsertTaxiPolicyDraft(getAdminApiClient(), body, { signal });
}

export async function publishTaxiPolicyDraft(
  signal?: AbortSignal,
): Promise<TaxiPolicyDto> {
  return publishTaxiPolicy(getAdminApiClient(), { signal });
}

export async function fetchTaxiPolicyHistory(
  signal?: AbortSignal,
): Promise<TaxiPolicyAuditDto[]> {
  return listTaxiPolicyHistory(getAdminApiClient(), { signal });
}
