import type { BatchSummaryDto } from '@autolokate/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchQrInventory } from '@/services/inventory/inventory-service';

export const qrBatchDetailQueryKeys = {
  byId: inventoryQueryKeys.byId,
};

function findBatchInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  batchId: string,
): BatchSummaryDto | null {
  const detail = queryClient.getQueryData<BatchSummaryDto>(qrBatchDetailQueryKeys.byId(batchId));
  if (detail?.id === batchId) {
    return detail;
  }

  const entries = queryClient.getQueriesData<BatchSummaryDto[] | BatchSummaryDto>({
    queryKey: inventoryQueryKeys.all,
  });
  for (const [, data] of entries) {
    if (!data) {
      continue;
    }
    if (!Array.isArray(data)) {
      if (data.id === batchId) {
        return data;
      }
      continue;
    }
    const found = data.find((batch) => batch.id === batchId);
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
    queryKey: batchId
      ? qrBatchDetailQueryKeys.byId(batchId)
      : ['admin', 'inventory', 'by-id', 'missing'],
    queryFn: async ({ signal }) => {
      if (!batchId) {
        throw new Error('Batch id is required.');
      }

      // Always hit the network for detail refreshes. Cache is only used for
      // initial/placeholder paint — returning list-cache rows as the success
      // payload can resurrect a pre-transition status after lifecycle mutations.
      const batches = await fetchQrInventory({}, signal);
      const found = batches.find((batch) => batch.id === batchId);
      if (!found) {
        throw new Error('Batch not found.');
      }
      return found;
    },
    enabled: Boolean(batchId),
    initialData: initialBatch ?? cachedBatch ?? undefined,
    placeholderData: (previous) => previous ?? initialBatch ?? cachedBatch ?? undefined,
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
