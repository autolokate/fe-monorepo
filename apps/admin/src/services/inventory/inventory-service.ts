import { listQrInventory, type BatchSummaryDto, type ListQrInventoryQuery } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchQrInventory(
  query: ListQrInventoryQuery = {},
  signal?: AbortSignal,
): Promise<BatchSummaryDto[]> {
  return listQrInventory(getAdminApiClient(), query, { signal });
}
