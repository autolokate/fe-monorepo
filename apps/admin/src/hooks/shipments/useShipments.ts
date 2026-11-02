import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import {
  toShipmentsQueryStatus,
  type ShipmentsStatusFilter,
} from '@/features/shipments/shipments-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextCursorOf } from '@/platform/query/cursor-pages';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchShipmentsPage } from '@/services/shipments/shipments-service';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

export const shipmentsQueryKeys = {
  all: ['admin', 'shipments'] as const,
  list: (statusFilter: ShipmentsStatusFilter) =>
    [...shipmentsQueryKeys.all, { status: toShipmentsQueryStatus(statusFilter) }] as const,
};

export function useShipments(initialStatusFilter: ShipmentsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useUrlFilterState<ShipmentsStatusFilter>(
    'status',
    initialStatusFilter,
  );

  const query = useInfiniteQuery({
    queryKey: shipmentsQueryKeys.list(statusFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchShipmentsPage(
        {
          status: toShipmentsQueryStatus(statusFilter),
          limit: ADMIN_LIST_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    meta: { errorMessage: 'Unable to load shipments.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'shipments', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const shipments = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const hasMore = query.hasNextPage;

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    shipments,
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
