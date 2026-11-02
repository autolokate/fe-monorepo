import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { toOrdersQueryStatus, type OrdersStatusFilter } from '@/features/orders/orders-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextCursorOf } from '@/platform/query/cursor-pages';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchOrdersPage } from '@/services/orders/orders-service';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

export const ordersQueryKeys = {
  all: ['admin', 'orders'] as const,
  list: (statusFilter: OrdersStatusFilter) =>
    [...ordersQueryKeys.all, { status: toOrdersQueryStatus(statusFilter) }] as const,
};

export function useOrders(initialStatusFilter: OrdersStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useUrlFilterState<OrdersStatusFilter>(
    'status',
    initialStatusFilter,
  );

  const query = useInfiniteQuery({
    queryKey: ordersQueryKeys.list(statusFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchOrdersPage(
        {
          status: toOrdersQueryStatus(statusFilter),
          limit: ADMIN_LIST_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    meta: { errorMessage: 'Unable to load orders.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'orders', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const orders = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const hasMore = query.hasNextPage;

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    orders,
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
