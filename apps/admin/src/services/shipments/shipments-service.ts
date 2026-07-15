import {
  listAdminShipmentsPage,
  type AdminShipmentsPageResult,
  type ListAdminShipmentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchShipmentsPage(
  query: ListAdminShipmentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminShipmentsPageResult> {
  return listAdminShipmentsPage(getAdminApiClient(), query, { signal });
}
