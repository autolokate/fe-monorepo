import type { BatchSummaryDto } from '@autolokate/api-client';

export type InventoryMetrics = {
  totalBatches: number;
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
    provisionedBatches: batches.filter((batch) => batch.status === 'PROVISIONED').length,
    inDistributionBatches: batches.filter((batch) => batch.status === 'IN_DISTRIBUTION').length,
    depletedBatches: batches.filter((batch) => batch.status === 'DEPLETED').length,
    scrappedBatches: batches.filter((batch) => batch.status === 'SCRAPPED').length,
    totalCodes: batches.reduce((sum, batch) => sum + batch.totalCount, 0),
    totalProvisionedCodes: batches.reduce((sum, batch) => sum + batch.provisionedCount, 0),
  };
}
