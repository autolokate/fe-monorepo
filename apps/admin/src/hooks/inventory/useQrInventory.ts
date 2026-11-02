import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  toInventoryQueryState,
  type InventoryStateFilter,
} from '@/features/inventory/inventory-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { nextCursorOf } from '@/platform/query/cursor-pages';
import {
  computeInventoryMetrics,
  INVENTORY_PAGE_LIMIT,
} from '@/services/inventory/inventory-metrics';
import { fetchQrInventoryPage } from '@/services/inventory/inventory-service';

/**
 * Cache shapes under `inventoryQueryKeys.all`:
 * - `list(state)` → `InfiniteData<QrInventoryPageResult>` (Inventory / Batches pages, Load more)
 * - `firstPage()` → `QrInventoryPageResult` (dashboard snapshot)
 * - `byId(id)` → `BatchSummaryDto` (batch detail, `GET /admin/v1/qr-batches/{id}`)
 */
export const inventoryQueryKeys = {
  all: ['admin', 'inventory'] as const,
  list: (stateFilter: InventoryStateFilter) =>
    [...inventoryQueryKeys.all, 'list', { state: toInventoryQueryState(stateFilter) }] as const,
  firstPage: () => [...inventoryQueryKeys.all, 'first-page'] as const,
  byId: (batchId: string) => [...inventoryQueryKeys.all, 'by-id', batchId] as const,
};

export function useQrInventory(initialStateFilter: InventoryStateFilter = 'ALL') {
  const [stateFilter, setStateFilter] = useState<InventoryStateFilter>(initialStateFilter);

  const query = useInfiniteQuery({
    queryKey: inventoryQueryKeys.list(stateFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchQrInventoryPage(
        {
          state: toInventoryQueryState(stateFilter),
          limit: INVENTORY_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    meta: { errorMessage: 'Unable to load QR inventory.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'inventory', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const batches = useMemo(
    () => (query.data ? query.data.pages.flatMap((page) => page.items) : undefined),
    [query.data],
  );
  const hasMore = query.hasNextPage;

  const metrics = useMemo(
    () => (batches ? computeInventoryMetrics(batches, hasMore) : null),
    [batches, hasMore],
  );

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    /** Every batch loaded so far (newest first); undefined until the first page lands. */
    data: batches,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    hasMore,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    stateFilter,
    setStateFilter,
    metrics,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
