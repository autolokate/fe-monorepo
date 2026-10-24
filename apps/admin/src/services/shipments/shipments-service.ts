import {
  listAdminShipmentsPage,
  type AdminShipmentDetail,
  type AdminShipmentsPageResult,
  type ListAdminShipmentsQuery,
  type ManualShipmentStatus,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

export async function fetchShipmentsPage(
  query: ListAdminShipmentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminShipmentsPageResult> {
  return listAdminShipmentsPage(getAdminApiClient(), query, { signal });
}

/** POST …/shipments/{orderId}/status — G0-4 Absent. Fail closed. */
export function updateShipmentStatus(
  _orderId: string,
  _status: ManualShipmentStatus,
  _signal?: AbortSignal,
): Promise<AdminShipmentDetail> {
  throwAdminProductBlocked('POST /admin/v1/shipments/{orderId}/status');
}
