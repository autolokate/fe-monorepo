import {
  listAdminShipmentsPage,
  type AdminShipmentsPageResult,
  type ListAdminShipmentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/**
 * Shipments are read-only: the backend projects them from paid retail orders and intentionally has
 * no status-update route, so there is no write wrapper here.
 */
export async function fetchShipmentsPage(
  query: ListAdminShipmentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminShipmentsPageResult> {
  return listAdminShipmentsPage(getAdminApiClient(), query, { signal });
}
