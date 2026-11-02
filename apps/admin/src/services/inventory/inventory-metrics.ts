import type { BatchSummaryDto } from '@autolokate/api-client';

/** `GET /admin/v1/inventory` returns at most the newest 100 batches and has no cursor. */
export const INVENTORY_SERVER_CAP = 100;

export type InventoryMetrics = {
  totalBatches: number;
  /** True when the server cap was hit — counts cover the newest batches only, not all stock. */
  capped: boolean;
  provisionedBatches: number;
  inDistributionBatches: number;
  depletedBatches: number;
  scrappedBatches: number;
  totalCodes: number;
  totalProvisionedCodes: number;
};

export function computeInventoryMetrics(batches: BatchSummaryDto[]): InventoryMetrics {
  return {
    totalBatches: batches.length,
    capped: batches.length >= INVENTORY_SERVER_CAP,
    provisionedBatches: batches.filter((batch) => batch.status === 'PROVISIONED').length,
    inDistributionBatches: batches.filter((batch) => batch.status === 'IN_DISTRIBUTION').length,
    depletedBatches: batches.filter((batch) => batch.status === 'DEPLETED').length,
    scrappedBatches: batches.filter((batch) => batch.status === 'SCRAPPED').length,
    totalCodes: batches.reduce((sum, batch) => sum + batch.totalCount, 0),
    totalProvisionedCodes: batches.reduce((sum, batch) => sum + batch.provisionedCount, 0),
  };
}
