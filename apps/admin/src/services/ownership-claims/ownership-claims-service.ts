import {
  listAdminOwnershipClaims,
  reviewOwnershipClaim,
  type ListAdminOwnershipClaimsQuery,
  type OwnershipClaimDto,
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
