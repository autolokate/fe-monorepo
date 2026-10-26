import type { AdminQaStatus } from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  describeRepliesReadError,
  fetchDiscoveryReplies,
  moderateDiscoveryReply,
} from '@/services/discovery/admin-replies-service';

export type ReplyStatusFilter = AdminQaStatus | 'ALL';

const repliesKey = () => [...discoveryQueryKeys.all, 'replies'] as const;

export function useDiscoveryReplies() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useState<ReplyStatusFilter>('VISIBLE');
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);

  const query = useQuery({
    queryKey: [...repliesKey(), 'list', { status, q }] as const,
    queryFn: ({ signal }) =>
      fetchDiscoveryReplies(
        { status: status === 'ALL' ? undefined : status, q: q || undefined },
        signal,
      ),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Q&A replies.' },
  });

  return {
    ...query,
    replies: query.data ?? [],
    status,
    setStatus,
    search,
    setSearch,
    userErrorMessage: query.isError ? describeRepliesReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useModerateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ replyId, status }: { replyId: string; status: AdminQaStatus }) =>
      moderateDiscoveryReply(replyId, status),
    retry: 0,
    onSuccess: async (reply) => {
      await queryClient.invalidateQueries({ queryKey: repliesKey() });
      showSuccessToast(
        reply.status === 'HIDDEN'
          ? 'Reply hidden from the consumer app.'
          : 'Reply restored in the consumer app.',
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'discovery:reply-moderation', toast: true });
    },
  });
}
