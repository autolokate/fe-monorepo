import {
  listAdminOrdersPage,
  type AdminOrdersPageResult,
  type ListAdminOrdersQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchOrdersPage(
  query: ListAdminOrdersQuery = {},
  signal?: AbortSignal,
): Promise<AdminOrdersPageResult> {
  return listAdminOrdersPage(getAdminApiClient(), query, { signal });
}
