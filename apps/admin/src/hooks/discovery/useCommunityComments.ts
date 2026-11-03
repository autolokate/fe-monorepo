import type {
  AdminCommunityCommentDto,
  AdminCommunityCommentStatus,
  AdminV4Page,
} from '@autolokate/api-client';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { nextCursorOf } from '@/platform/query/cursor-pages';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import {
  COMMENTS_PAGE_LIMIT,
  fetchCommunityCommentsPage,
  moderateCommunityComment,
} from '@/services/discovery/admin-comments-service';

export type CommentStatusFilter = AdminCommunityCommentStatus | 'ALL';

export const COMMENT_STATUS_VALUES: readonly CommentStatusFilter[] = ['ALL', 'VISIBLE', 'HIDDEN'];

const commentsKey = () => [...discoveryQueryKeys.all, 'comments'] as const;

export function useCommunityComments() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useUrlFilterState<CommentStatusFilter>(
    'status',
    'ALL',
    COMMENT_STATUS_VALUES,
  );
  const [search, setSearch] = useUrlTextState('q');
  const [reelId, setReelId] = useUrlTextState('reelId');
  const [partnerOrgId, setPartnerOrgId] = useUrlTextState('partnerOrgId');
  const q = useDebouncedValue(search.trim(), 300);
  const reel = useDebouncedValue(reelId.trim(), 400);
  const org = useDebouncedValue(partnerOrgId.trim(), 400);

  const filters = { status, q, reelId: reel, partnerOrgId: org };
  const query = useInfiniteQuery({
    queryKey: [...commentsKey(), 'list', filters] as const,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchCommunityCommentsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          ...(q ? { q } : {}),
          ...(reel ? { reelId: reel } : {}),
          ...(org ? { partnerOrgId: org } : {}),
          limit: COMMENTS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: nextCursorOf,
    enabled: canRead,
    retry: false,
  });

  const comments = useMemo<AdminCommunityCommentDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);

  return {
    ...query,
    comments,
    notDeployed,
    status,
    setStatus,
    search,
    setSearch,
    reelId,
    setReelId,
    partnerOrgId,
    setPartnerOrgId,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

type CommentPages = InfiniteData<AdminV4Page<AdminCommunityCommentDto>, string | undefined>;

export function useModerateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: AdminCommunityCommentStatus; reason?: string }) =>
      moderateCommunityComment(input.id, input.status, input.reason),
    retry: 0,
    onSuccess: (comment) => {
      // Swap the moderated row in place so the operator keeps their scroll position.
      queryClient.setQueriesData<CommentPages>({ queryKey: commentsKey() }, (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                items: page.items.map((item) => (item.id === comment.id ? comment : item)),
              })),
            }
          : current,
      );
      showSuccessToast(
        comment.status === 'HIDDEN'
          ? 'Comment hidden from the apps.'
          : 'Comment restored in the apps.',
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:comment-moderation', toast: false });
    },
  });
}
