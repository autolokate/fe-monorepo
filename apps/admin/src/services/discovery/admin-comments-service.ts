import {
  listAdminCommunityComments,
  moderateAdminCommunityComment,
  type AdminCommunityCommentDto,
  type AdminCommunityCommentStatus,
  type AdminV4Page,
  type ListAdminCommunityCommentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export const COMMENTS_PAGE_LIMIT = 50;

/** GET /admin/v1/community/comments */
export async function fetchCommunityCommentsPage(
  query: ListAdminCommunityCommentsQuery,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminCommunityCommentDto>> {
  return listAdminCommunityComments(getAdminApiClient(), query, { signal });
}

/** PATCH /admin/v1/community/comments/{id} — audit `COMMUNITY_COMMENT_MODERATION`. */
export async function moderateCommunityComment(
  id: string,
  status: AdminCommunityCommentStatus,
  reason?: string,
): Promise<AdminCommunityCommentDto> {
  return moderateAdminCommunityComment(getAdminApiClient(), id, {
    status,
    ...(reason ? { reason } : {}),
  });
}
