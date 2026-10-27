import {
  getMediaDownloadUrl,
  listAdminOwnershipClaims,
  reviewOwnershipClaim,
  type ListAdminOwnershipClaimsQuery,
  type MediaDownloadDto,
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

/**
 * Attempt signed download for RC proof via customer media GET `/v1/media/{id}`.
 * Admin OPERATOR token often fails ACL (asset owned by claimant) — callers must
 * surface that honestly; never invent a placeholder image.
 */
export async function fetchRcMediaDownloadUrl(
  mediaAssetId: string,
  signal?: AbortSignal,
): Promise<MediaDownloadDto> {
  return getMediaDownloadUrl(getAdminApiClient(), mediaAssetId, { signal });
}
