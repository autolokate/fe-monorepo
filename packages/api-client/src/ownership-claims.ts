import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';
import type { OwnershipClaimDto, OwnershipClaimStatus } from './admin';

/**
 * Customer ownership-claim client (`/v1/ownership-claims`).
 * Admin list/review + `OwnershipClaimDto` (incl. `rcMediaAssetId`, `reviewedByAdminId`,
 * `reviewedAt`, `planSubscriptionId`, `notes`) live in `./admin`.
 */
export type { OwnershipClaimDto, OwnershipClaimStatus };

/** Body for `POST /v1/ownership-claims` (M8). */
export type SubmitOwnershipClaimBody = {
  vehicleId: string;
  rcMediaAssetId: string;
  planSubscriptionId?: string;
  notes?: string;
};

/** GET /v1/ownership-claims — caller's claims only. */
export async function listOwnershipClaims(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<OwnershipClaimDto[]> {
  const response = await client.get<unknown>(endpoints.ownershipClaims.list, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as OwnershipClaimDto[];
}

/** GET /v1/ownership-claims/{id} — scoped to caller. */
export async function getOwnershipClaim(
  client: ApiClient,
  claimId: string,
  options: { signal?: AbortSignal } = {},
): Promise<OwnershipClaimDto> {
  const response = await client.get<unknown>(endpoints.ownershipClaims.byId(claimId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as OwnershipClaimDto;
}

/** POST /v1/ownership-claims — optional Idempotency-Key header. */
export async function submitOwnershipClaim(
  client: ApiClient,
  body: SubmitOwnershipClaimBody,
  options: { signal?: AbortSignal; idempotencyKey?: string } = {},
): Promise<OwnershipClaimDto> {
  const headers: Record<string, string> = {};
  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }
  const response = await client.post<unknown>(endpoints.ownershipClaims.create, body, {
    ...(options.signal ? { signal: options.signal } : {}),
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  });
  return unwrapEnvelope(response) as OwnershipClaimDto;
}
