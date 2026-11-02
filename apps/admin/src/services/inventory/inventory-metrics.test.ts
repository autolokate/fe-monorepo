import type { BatchSummaryDto } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { computeInventoryMetrics, formatLoadedCount } from '@/services/inventory/inventory-metrics';

function batch(id: string, status: BatchSummaryDto['status']): BatchSummaryDto {
  return {
    id,
    batchCode: `B-${id}`,
    channel: 'B2C',
    skuId: 'sku',
    status,
    totalCount: 10,
    generatedCount: 10,
    provisionedCount: status === 'PROVISIONED' ? 10 : 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    provisionedAt: null,
  };
}

describe('computeInventoryMetrics', () => {
  it('is capped only when the server reports more pages — never from the row count', () => {
    const full = Array.from({ length: 100 }, (_, index) => batch(String(index), 'DRAFT'));
    expect(computeInventoryMetrics(full, false).capped).toBe(false);
    expect(computeInventoryMetrics(full, true).capped).toBe(true);
    expect(computeInventoryMetrics(full).capped).toBe(false);
  });

  it('rolls up status counts and codes over the loaded batches', () => {
    const metrics = computeInventoryMetrics([batch('a', 'PROVISIONED'), batch('b', 'SCRAPPED')]);
    expect(metrics).toMatchObject({
      totalBatches: 2,
      provisionedBatches: 1,
      scrappedBatches: 1,
      totalCodes: 20,
      totalProvisionedCodes: 10,
    });
  });
});

describe('formatLoadedCount', () => {
  it('appends + only while more pages exist', () => {
    expect(formatLoadedCount(100, true)).toBe('100+');
    expect(formatLoadedCount(100, false)).toBe('100');
  });
});
