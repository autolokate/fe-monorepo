import { useMemo } from 'react';

import { useQrInventory } from '@/hooks/inventory/useQrInventory';
import { computeBatchManagementMetrics } from '@/services/qr-batches/batch-lifecycle';

/** Batch management list — reuses inventory query and metrics with management-specific rollups. */
export function useQrBatches(initialStateFilter?: Parameters<typeof useQrInventory>[0]) {
  const inventory = useQrInventory(initialStateFilter);

  const metrics = useMemo(
    () => (inventory.data ? computeBatchManagementMetrics(inventory.data) : null),
    [inventory.data],
  );

  return {
    ...inventory,
    metrics,
  };
}
