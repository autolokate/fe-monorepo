import {
  listQrBatchCodesPage,
  type ListQrBatchCodesQuery,
  type QrBatchCodesPageResult,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchQrBatchCodesPage(
  batchId: string,
  query: ListQrBatchCodesQuery = {},
  signal?: AbortSignal,
): Promise<QrBatchCodesPageResult> {
  return listQrBatchCodesPage(getAdminApiClient(), batchId, query, { signal });
}
