import type { AdminCommunityQuestionDto } from '@autolokate/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  DISCOVERY_LIST_LIMIT,
  discoveryQueryKeys,
  type DiscoveryQuestionListParams,
} from '@/hooks/discovery/discovery-query-keys';
import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchDiscoveryQuestionsPage } from '@/services/discovery/admin-discovery-service';
import { describeDiscoveryReadError } from '@/services/discovery/discovery-errors';

export function useDiscoveryQuestions() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useState<DiscoveryQuestionListParams['status']>('ALL');
  const [category, setCategory] = useState<DiscoveryQuestionListParams['category']>('ALL');
  const [sort, setSort] = useState<DiscoveryQuestionListParams['sort']>('latest');
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);

  const params = useMemo<DiscoveryQuestionListParams>(
    () => ({ status, category, sort, q }),
    [status, category, sort, q],
  );

  const query = useInfiniteQuery({
    queryKey: discoveryQueryKeys.questionsList(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchDiscoveryQuestionsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          ...(category === 'ALL' ? {} : { category }),
          sort,
          ...(q ? { q } : {}),
          limit: DISCOVERY_LIST_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Q&A.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'discovery:questions', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const questions = useMemo<AdminCommunityQuestionDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const lastPagination = query.data?.pages.at(-1)?.pagination ?? null;
  const mayBeTruncated =
    !query.hasNextPage && lastPagination === null && questions.length >= DISCOVERY_LIST_LIMIT;

  return {
    ...query,
    questions,
    mayBeTruncated,
    status,
    setStatus,
    category,
    setCategory,
    sort,
    setSort,
    search,
    setSearch,
    userErrorMessage: query.isError ? describeDiscoveryReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
