import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  toInventoryQueryState,
  type InventoryStateFilter,
} from '@/features/inventory/inventory-filters.js';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors.js';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error.js';
import { computeInventoryMetrics } from '@/services/inventory/inventory-metrics.js';
import { fetchQrInventory } from '@/services/inventory/inventory-service.js';

export const inventoryQueryKeys = {
  all: ['admin', 'inventory'] as const,
  list: (stateFilter: InventoryStateFilter) =>
    [...inventoryQueryKeys.all, { state: toInventoryQueryState(stateFilter) }] as const,
};

export function useQrInventory(initialStateFilter: InventoryStateFilter = 'ALL') {
  const [stateFilter, setStateFilter] = useState<InventoryStateFilter>(initialStateFilter);

  const query = useQuery({
    queryKey: inventoryQueryKeys.list(stateFilter),
    queryFn: ({ signal }) =>
      fetchQrInventory({ state: toInventoryQueryState(stateFilter) }, signal),
    meta: { errorMessage: 'Unable to load QR inventory.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'inventory', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const metrics = useMemo(
    () => (query.data ? computeInventoryMetrics(query.data) : null),
    [query.data],
  );

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    stateFilter,
    setStateFilter,
    metrics,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
