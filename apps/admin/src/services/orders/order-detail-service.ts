import { getAdminOrder, type AdminOrderDetail } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/orders/{orderId} — Nest order detail (money + partner stamp; no secrets). */
export async function fetchOrderDetail(
  orderId: string,
  signal?: AbortSignal,
): Promise<AdminOrderDetail> {
  return getAdminOrder(getAdminApiClient(), orderId, { signal });
}
