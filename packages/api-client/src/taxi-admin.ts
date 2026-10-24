import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** OpenAPI Taxi policy snapshot (Admin) — bps Admin-supplied; no invented money defaults. */
export type TaxiPolicyDto = {
  id?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  customerAdvanceBps?: number;
  partnerDepositBps?: number;
  [key: string]: unknown;
};

export type TaxiPolicyAuditDto = {
  id: string;
  publishedAt?: string;
  [key: string]: unknown;
};

/** GET /admin/v1/taxi/policy */
export async function getTaxiPolicy(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.get<unknown>(endpoints.adminTaxi.policy, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** PUT /admin/v1/taxi/policy — create/replace DRAFT */
export async function upsertTaxiPolicyDraft(
  client: ApiClient,
  body: Record<string, unknown>,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.put<unknown>(endpoints.adminTaxi.policy, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** POST /admin/v1/taxi/policy/publish */
export async function publishTaxiPolicy(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyDto> {
  const response = await client.post<unknown>(
    endpoints.adminTaxi.policyPublish,
    {},
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as TaxiPolicyDto;
}

/** GET /admin/v1/taxi/policy/history */
export async function listTaxiPolicyHistory(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<TaxiPolicyAuditDto[]> {
  const response = await client.get<unknown>(endpoints.adminTaxi.policyHistory, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TaxiPolicyAuditDto[];
}
