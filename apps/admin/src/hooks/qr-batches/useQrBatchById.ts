import { ApiError, type BatchSummaryDto } from '@autolokate/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { isAdminRouteNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchQrBatch } from '@/services/inventory/inventory-service';

export const qrBatchDetailQueryKeys = {
  byId: inventoryQueryKeys.byId,
};

/** A batch row already in any inventory cache (detail, dashboard page, or infinite list pages). */
function findBatchInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  batchId: string,
): BatchSummaryDto | null {
  const detail = queryClient.getQueryData<BatchSummaryDto>(qrBatchDetailQueryKeys.byId(batchId));
  if (detail?.id === batchId) {
    return detail;
  }

  const entries = queryClient.getQueriesData({ queryKey: inventoryQueryKeys.all });
  for (const [, data] of entries) {
    if (!data || typeof data !== 'object') continue;
    const pages = (data as { pages?: { items?: BatchSummaryDto[] }[] }).pages;
    const items = Array.isArray(pages)
      ? pages.flatMap((page) => page.items ?? [])
      : ((data as { items?: BatchSummaryDto[] }).items ?? null);
    if (items) {
      const found = items.find((batch) => batch.id === batchId);
      if (found) return found;
      continue;
    }
    if ((data as BatchSummaryDto).id === batchId) {
      return data as BatchSummaryDto;
    }
  }
  return null;
}

/** A 404 for the batch itself (unknown id) — not an undeployed route. */
function isBatchNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && !isAdminRouteNotDeployed(error);
}

/** Batch detail from `GET /admin/v1/qr-batches/{id}` — works for any batch, however old. */
export function useQrBatchById(batchId: string | undefined, initialBatch?: BatchSummaryDto | null) {
  const queryClient = useQueryClient();

  const cachedBatch = useMemo(
    () => (batchId ? findBatchInCache(queryClient, batchId) : null),
    [batchId, queryClient],
  );

  const query = useQuery({
    queryKey: batchId
      ? qrBatchDetailQueryKeys.byId(batchId)
      : ['admin', 'inventory', 'by-id', 'missing'],
    queryFn: ({ signal }) => {
      if (!batchId) {
        throw new Error('Batch id is required.');
      }
      // Always hit the network for detail refreshes. Cache is only used for initial/placeholder
      // paint — returning list-cache rows as the success payload can resurrect a pre-transition
      // status after lifecycle mutations.
      return fetchQrBatch(batchId, signal);
    },
    enabled: Boolean(batchId),
    retry: (count, error) => !isBatchNotFound(error) && count < 2,
    initialData: initialBatch ?? cachedBatch ?? undefined,
    placeholderData: (previous) => previous ?? initialBatch ?? cachedBatch ?? undefined,
    staleTime: initialBatch || cachedBatch ? 0 : undefined,
  });

  const notFound = isBatchNotFound(query.error);
  const userErrorMessage =
    query.isError && !notFound ? mapAdminApiError(query.error).userMessage : null;

  return {
    batch: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage,
    /** Set when the server has no batch with this id. */
    notFoundMessage: notFound ? 'This batch may have been removed or the link is invalid.' : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
