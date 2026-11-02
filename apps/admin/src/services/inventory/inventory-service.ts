import {
  getQrBatch,
  listQrInventoryPage,
  type BatchSummaryDto,
  type ListQrInventoryQuery,
  type QrInventoryPageResult,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/inventory — one keyset page (newest first) with `meta.pagination`. */
export async function fetchQrInventoryPage(
  query: ListQrInventoryQuery = {},
  signal?: AbortSignal,
): Promise<QrInventoryPageResult> {
  return listQrInventoryPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/qr-batches/{id} — a single batch, whatever its age. */
export async function fetchQrBatch(
  batchId: string,
  signal?: AbortSignal,
): Promise<BatchSummaryDto> {
  return getQrBatch(getAdminApiClient(), batchId, { signal });
}
