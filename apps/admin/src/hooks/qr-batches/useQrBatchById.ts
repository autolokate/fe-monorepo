import type { BatchSummaryDto } from '@autolokate/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchQrInventory } from '@/services/inventory/inventory-service';
import { INVENTORY_SERVER_CAP } from '@/services/inventory/inventory-metrics';

/** The batch isn't in `GET /admin/v1/inventory` (there is no `GET /admin/v1/qr-batches/{id}`). */
export class QrBatchNotListedError extends Error {
  constructor(readonly listCapped: boolean) {
    super(
      listCapped
        ? 'This batch is older than the newest 100 the server lists, and there is no single-batch lookup yet, so its detail can’t be loaded.'
        : 'This batch may have been removed or the link is invalid.',
    );
    this.name = 'QrBatchNotListedError';
  }
}

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
        throw new QrBatchNotListedError(batches.length >= INVENTORY_SERVER_CAP);
      }
      return found;
    },
    enabled: Boolean(batchId),
    retry: (count, error) => !(error instanceof QrBatchNotListedError) && count < 2,
    initialData: initialBatch ?? cachedBatch ?? undefined,
    placeholderData: (previous) => previous ?? initialBatch ?? cachedBatch ?? undefined,
    staleTime: initialBatch || cachedBatch ? 0 : undefined,
  });

  const notListed = query.error instanceof QrBatchNotListedError ? query.error : null;
  const userErrorMessage =
    query.isError && !notListed ? mapAdminApiError(query.error).userMessage : null;

  return {
    batch: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage,
    /** Set when the batch isn't in the server's list — the message says why. */
    notListedMessage: notListed?.message ?? null,
    refresh: () => {
      void query.refetch();
    },
  };
}
