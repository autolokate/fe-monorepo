import {
  getAdminOwnershipClaimRcProof,
  getOwnershipReviewAccess,
  listAdminOwnershipClaims,
  listAdminOwnershipClaimsPage,
  listAdminVehicleOwnershipHistory,
  reviewOwnershipClaim,
  type AdminOwnershipClaimDto,
  type AdminOwnershipClaimsPageResult,
  type ListAdminOwnershipClaimsQuery,
  type OwnershipClaimReviewResultDto,
  type OwnershipClaimRcProofDto,
  type OwnershipReviewAccessDto,
  type ReviewOwnershipClaimBody,
  type VehicleOwnershipHistoryDto,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/ownership-claims — first page only (dashboard attention counts). */
export async function fetchOwnershipClaims(
  query: ListAdminOwnershipClaimsQuery = {},
  signal?: AbortSignal,
): Promise<AdminOwnershipClaimDto[]> {
  return listAdminOwnershipClaims(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/ownership-claims?status&limit&cursor — one keyset page. */
export async function fetchOwnershipClaimsPage(
  query: ListAdminOwnershipClaimsQuery,
  signal?: AbortSignal,
): Promise<AdminOwnershipClaimsPageResult> {
  return listAdminOwnershipClaimsPage(getAdminApiClient(), query, { signal });
}

/** POST /admin/v1/ownership-claims/{id}/review */
export async function reviewClaim(
  claimId: string,
  body: ReviewOwnershipClaimBody,
  signal?: AbortSignal,
): Promise<OwnershipClaimReviewResultDto> {
  return reviewOwnershipClaim(getAdminApiClient(), claimId, body, { signal });
}

/** GET /admin/v1/ownership-claims/review-access — the server allowlist verdict, never inferred. */
export async function fetchOwnershipReviewAccess(
  signal?: AbortSignal,
): Promise<OwnershipReviewAccessDto> {
  return getOwnershipReviewAccess(getAdminApiClient(), { signal });
}

/** GET /admin/v1/vehicles/{vehicleId}/ownership-history — newest first. */
export async function fetchVehicleOwnershipHistory(
  vehicleId: string,
  signal?: AbortSignal,
): Promise<VehicleOwnershipHistoryDto[]> {
  return listAdminVehicleOwnershipHistory(getAdminApiClient(), vehicleId, { signal });
}

/**
 * Signed download for claim RC_PROOF via Admin
 * `GET /admin/v1/ownership-claims/{claimId}/rc-proof` (OPERATOR; audited RCRECORD_ACCESS).
 * Callers must surface 403/404 as an honest ACL / endpoint blocker — never invent a preview.
 */
export async function fetchRcClaimProofDownloadUrl(
  claimId: string,
  signal?: AbortSignal,
): Promise<OwnershipClaimRcProofDto> {
  return getAdminOwnershipClaimRcProof(getAdminApiClient(), claimId, { signal });
}
