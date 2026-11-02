import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import {
  toSubscriptionsQueryStatus,
  type SubscriptionsStatusFilter,
} from '@/features/subscriptions/subscriptions-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextOffsetOf } from '@/platform/query/cursor-pages';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchSubscriptions } from '@/services/subscriptions/subscriptions-service';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

export const subscriptionsQueryKeys = {
  all: ['admin', 'subscriptions'] as const,
  list: (statusFilter: SubscriptionsStatusFilter) =>
    [...subscriptionsQueryKeys.all, { status: toSubscriptionsQueryStatus(statusFilter) }] as const,
};

export function useSubscriptions(initialStatusFilter: SubscriptionsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useUrlFilterState<SubscriptionsStatusFilter>(
    'status',
    initialStatusFilter,
  );

  const query = useInfiniteQuery({
    queryKey: subscriptionsQueryKeys.list(statusFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchSubscriptions(
        {
          status: toSubscriptionsQueryStatus(statusFilter),
          limit: ADMIN_LIST_PAGE_SIZE,
          offset: pageParam,
        },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => nextOffsetOf(lastPage, allPages),
    meta: { errorMessage: 'Unable to load subscriptions.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'subscriptions', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const subscriptions = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);
  const hasMore = query.hasNextPage;

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    subscriptions,
    hasMore,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
