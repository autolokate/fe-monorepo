import {
  ApiError,
  listAdminCommunityReplies,
  moderateAdminCommunityReply,
  type AdminCommunityReplyDto,
  type AdminQaStatus,
  type ListAdminCommunityRepliesQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { describeDiscoveryReadError } from '@/services/discovery/discovery-errors';

export const REPLIES_LIST_LIMIT = 100;

export function describeRepliesReadError(error: unknown): string {
  if (error instanceof ApiError && error.code === 'feature_not_provisioned') {
    return 'Q&A replies are not provisioned on this environment yet (database migration 0087 pending).';
  }
  return describeDiscoveryReadError(error);
}

/** GET /admin/v1/community/replies */
export async function fetchDiscoveryReplies(
  query: ListAdminCommunityRepliesQuery,
  signal?: AbortSignal,
): Promise<AdminCommunityReplyDto[]> {
  return listAdminCommunityReplies(
    getAdminApiClient(),
    { ...query, limit: REPLIES_LIST_LIMIT },
    { signal },
  );
}

/** PATCH /admin/v1/community/replies/{id} — audited `DISCOVERY_QA_MODERATION`. */
export async function moderateDiscoveryReply(
  replyId: string,
  status: AdminQaStatus,
): Promise<AdminCommunityReplyDto> {
  return moderateAdminCommunityReply(getAdminApiClient(), replyId, status);
}
