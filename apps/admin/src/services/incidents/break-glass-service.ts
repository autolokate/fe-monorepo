import {
  approveBreakGlassApproval,
  denyBreakGlassApproval,
  getBreakGlassApproval,
  requestBreakGlassApproval,
  type BreakGlassApprovalDto,
  type RequestBreakGlassApprovalBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** POST /admin/v1/break-glass/approvals */
export async function requestBreakGlass(
  body: RequestBreakGlassApprovalBody,
  signal?: AbortSignal,
): Promise<BreakGlassApprovalDto> {
  return requestBreakGlassApproval(getAdminApiClient(), body, { signal });
}

/** GET /admin/v1/break-glass/approvals/{approvalId} */
export async function fetchBreakGlassApproval(
  approvalId: string,
  signal?: AbortSignal,
): Promise<BreakGlassApprovalDto> {
  return getBreakGlassApproval(getAdminApiClient(), approvalId, { signal });
}

/** POST /admin/v1/break-glass/approvals/{approvalId}/approve — distinct admin required. */
export async function approveBreakGlass(
  approvalId: string,
  signal?: AbortSignal,
): Promise<BreakGlassApprovalDto> {
  return approveBreakGlassApproval(getAdminApiClient(), approvalId, { signal });
}

/** POST /admin/v1/break-glass/approvals/{approvalId}/deny */
export async function denyBreakGlass(
  approvalId: string,
  signal?: AbortSignal,
): Promise<BreakGlassApprovalDto> {
  return denyBreakGlassApproval(getAdminApiClient(), approvalId, { signal });
}
