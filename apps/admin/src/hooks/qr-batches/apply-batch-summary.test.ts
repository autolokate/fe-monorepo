import type { BatchSummaryDto, QrInventoryPageResult } from '@autolokate/api-client';
import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { applyBatchSummaryToCaches } from '@/hooks/qr-batches/useQrBatchMutations';

function batch(id: string, status: BatchSummaryDto['status']): BatchSummaryDto {
  return {
    id,
    batchCode: `B-${id}`,
    channel: 'B2C',
    skuId: 'sku',
    status,
    totalCount: 5,
    generatedCount: 0,
    provisionedCount: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    provisionedAt: null,
  };
}

function page(items: BatchSummaryDto[], hasMore: boolean): QrInventoryPageResult {
  return {
    items,
    pagination: { limit: 100, cursor: null, nextCursor: hasMore ? 'next' : null, hasMore },
    requestId: null,
    correlationId: null,
  };
}

describe('applyBatchSummaryToCaches', () => {
  it('updates the batch wherever it sits: infinite list pages, dashboard page and detail', () => {
    const client = new QueryClient();
    client.setQueryData<InfiniteData<QrInventoryPageResult>>(inventoryQueryKeys.list('ALL'), {
      pages: [page([batch('a', 'DRAFT')], true), page([batch('b', 'DRAFT')], false)],
      pageParams: [undefined, 'next'],
    });
    client.setQueryData(inventoryQueryKeys.firstPage(), page([batch('b', 'DRAFT')], false));

    applyBatchSummaryToCaches(client, batch('b', 'CODES_GENERATED'));

    const list = client.getQueryData<InfiniteData<QrInventoryPageResult>>(
      inventoryQueryKeys.list('ALL'),
    );
    expect(list?.pages[0]?.items.map((row) => row.status)).toEqual(['DRAFT']);
    expect(list?.pages[1]?.items.map((row) => row.status)).toEqual(['CODES_GENERATED']);
    expect(
      client.getQueryData<QrInventoryPageResult>(inventoryQueryKeys.firstPage())?.items[0]?.status,
    ).toBe('CODES_GENERATED');
    expect(client.getQueryData<BatchSummaryDto>(inventoryQueryKeys.byId('b'))?.status).toBe(
      'CODES_GENERATED',
    );
  });

  it('prepends a created batch to the first list page only', () => {
    const client = new QueryClient();
    client.setQueryData<InfiniteData<QrInventoryPageResult>>(inventoryQueryKeys.list('ALL'), {
      pages: [page([batch('a', 'DRAFT')], true), page([batch('b', 'DRAFT')], false)],
      pageParams: [undefined, 'next'],
    });

    applyBatchSummaryToCaches(client, batch('new', 'DRAFT'), { appendIfMissing: true });

    const list = client.getQueryData<InfiniteData<QrInventoryPageResult>>(
      inventoryQueryKeys.list('ALL'),
    );
    expect(list?.pages[0]?.items.map((row) => row.id)).toEqual(['new', 'a']);
    expect(list?.pages[1]?.items.map((row) => row.id)).toEqual(['b']);
  });
});
