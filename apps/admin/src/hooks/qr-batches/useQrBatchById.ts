import type { BatchSummaryDto } from '@autolokate/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchQrInventory } from '@/services/inventory/inventory-service';

export const qrBatchDetailQueryKeys = {
  byId: (batchId: string) => [...inventoryQueryKeys.all, 'by-id', batchId] as const,
};

function findBatchInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  batchId: string,
): BatchSummaryDto | null {
  const entries = queryClient.getQueriesData<BatchSummaryDto[]>({ queryKey: inventoryQueryKeys.all });
  for (const [, data] of entries) {
    const found = data?.find((batch) => batch.id === batchId);
    if (found) {
      return found;
    }
  }
  return null;
}

export function useQrBatchById(batchId: string | undefined, initialBatch?: BatchSummaryDto | null) {
  const queryClient = useQueryClient();

  const cachedBatch = useMemo(
    () => (batchId ? findBatchInCache(queryClient, batchId) : null),
    [batchId, queryClient],
  );

  const query = useQuery({
    queryKey: batchId ? qrBatchDetailQueryKeys.byId(batchId) : ['admin', 'inventory', 'by-id', 'missing'],
    queryFn: async ({ signal }) => {
      if (!batchId) {
        throw new Error('Batch id is required.');
      }

      const fromCache = findBatchInCache(queryClient, batchId);
      if (fromCache) {
        return fromCache;
      }

      const batches = await fetchQrInventory({}, signal);
      const found = batches.find((batch) => batch.id === batchId);
      if (!found) {
        throw new Error('Batch not found.');
      }
      return found;
    },
    enabled: Boolean(batchId),
    initialData: initialBatch ?? cachedBatch ?? undefined,
    staleTime: initialBatch || cachedBatch ? 0 : undefined,
  });

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    batch: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
