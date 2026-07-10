import type { ListSkusQuery, SkuSummaryDto } from '@autolokate/api-client';
import { listSkus } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchSkus(
  query: ListSkusQuery = {},
  signal?: AbortSignal,
): Promise<SkuSummaryDto[]> {
  return listSkus(getAdminApiClient(), query, { signal });
}
