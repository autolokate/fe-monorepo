import type { BatchSummaryDto } from '@autolokate/api-client';

/** `GET /admin/v1/inventory` page size (server max 100); later pages follow `meta.pagination.nextCursor`. */
export const INVENTORY_PAGE_LIMIT = 100;

export type InventoryMetrics = {
  totalBatches: number;
  /** True when the server says more pages exist — counts cover the loaded batches only. */
  capped: boolean;
  provisionedBatches: number;
  inDistributionBatches: number;
  depletedBatches: number;
  scrappedBatches: number;
  totalCodes: number;
  totalProvisionedCodes: number;
};

/**
 * Rollups over the batches loaded so far. `hasMore` comes from `meta.pagination.hasMore`, never from
 * the row count, so a full last page is not mistaken for a truncated list.
 */
export function computeInventoryMetrics(
  batches: BatchSummaryDto[],
  hasMore = false,
): InventoryMetrics {
  return {
    totalBatches: batches.length,
    capped: hasMore,
    provisionedBatches: batches.filter((batch) => batch.status === 'PROVISIONED').length,
    inDistributionBatches: batches.filter((batch) => batch.status === 'IN_DISTRIBUTION').length,
    depletedBatches: batches.filter((batch) => batch.status === 'DEPLETED').length,
    scrappedBatches: batches.filter((batch) => batch.status === 'SCRAPPED').length,
    totalCodes: batches.reduce((sum, batch) => sum + batch.totalCount, 0),
    totalProvisionedCodes: batches.reduce((sum, batch) => sum + batch.provisionedCount, 0),
  };
}

/** A count over a partial list reads "100+" so it never claims to be the full total. */
export function formatLoadedCount(value: number, hasMore: boolean): string {
  return hasMore ? `${value.toLocaleString()}+` : value.toLocaleString();
}
