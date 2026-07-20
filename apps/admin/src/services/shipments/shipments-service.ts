import {
  listAdminShipmentsPage,
  updateAdminShipmentStatus,
  type AdminShipmentDetail,
  type AdminShipmentsPageResult,
  type ListAdminShipmentsQuery,
  type ManualShipmentStatus,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchShipmentsPage(
  query: ListAdminShipmentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminShipmentsPageResult> {
  return listAdminShipmentsPage(getAdminApiClient(), query, { signal });
}

export async function updateShipmentStatus(
  orderId: string,
  status: ManualShipmentStatus,
  signal?: AbortSignal,
): Promise<AdminShipmentDetail> {
  return updateAdminShipmentStatus(getAdminApiClient(), orderId, { status }, { signal });
}
