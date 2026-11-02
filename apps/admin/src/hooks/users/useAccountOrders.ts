import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextCursorOf } from '@/platform/query/cursor-pages';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchOrdersPage } from '@/services/orders/orders-service';

export const accountOrdersQueryKeys = {
  all: ['admin', 'users', 'orders'] as const,
  list: (accountId: string) => [...accountOrdersQueryKeys.all, accountId] as const,
};

/**
 * The resolved account's orders, for the customer drill-down. Sibling to `useOrders`, which is
 * status-filtered for the console grid; this one scopes the same `GET /admin/v1/orders` list by
 * `accountId` and carries no status filter.
 */
export function useAccountOrders(accountId: string) {
  const query = useInfiniteQuery({
    queryKey: accountOrdersQueryKeys.list(accountId),
    queryFn: ({ pageParam, signal }) =>
      fetchOrdersPage(
        { accountId, limit: ADMIN_LIST_PAGE_SIZE, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    meta: { errorMessage: 'Unable to load orders for this account.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'users:account-orders', toast: true });
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
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
