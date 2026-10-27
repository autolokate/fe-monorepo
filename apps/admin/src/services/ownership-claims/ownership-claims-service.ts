import {
  getAdminOwnershipClaimRcProof,
  listAdminOwnershipClaims,
  reviewOwnershipClaim,
  type ListAdminOwnershipClaimsQuery,
  type OwnershipClaimDto,
  type OwnershipClaimRcProofDto,
  type ReviewOwnershipClaimBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/ownership-claims */
export async function fetchOwnershipClaims(
  query: ListAdminOwnershipClaimsQuery = {},
  signal?: AbortSignal,
): Promise<OwnershipClaimDto[]> {
  return listAdminOwnershipClaims(getAdminApiClient(), query, { signal });
}

/** POST /admin/v1/ownership-claims/{id}/review */
export async function reviewClaim(
  claimId: string,
  body: ReviewOwnershipClaimBody,
  signal?: AbortSignal,
): Promise<OwnershipClaimDto> {
  return reviewOwnershipClaim(getAdminApiClient(), claimId, body, { signal });
}

/**
 * Signed download for claim RC_PROOF via Admin
 * `GET /admin/v1/ownership-claims/{claimId}/rc-proof` (OPERATOR).
 * Callers must surface 403/404 as an honest ACL / endpoint blocker — never invent a preview.
 */
export async function fetchRcClaimProofDownloadUrl(
  claimId: string,
  signal?: AbortSignal,
): Promise<OwnershipClaimRcProofDto> {
  return getAdminOwnershipClaimRcProof(getAdminApiClient(), claimId, { signal });
}
