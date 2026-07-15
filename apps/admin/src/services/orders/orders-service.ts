import {
  listAdminOrdersPage,
  refundAdminOrder,
  type AdminOrdersPageResult,
  type ListAdminOrdersQuery,
  type RefundOrderResult,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchOrdersPage(
  query: ListAdminOrdersQuery = {},
  signal?: AbortSignal,
): Promise<AdminOrdersPageResult> {
  return listAdminOrdersPage(getAdminApiClient(), query, { signal });
}

/** POST /admin/v1/orders/{orderId}/refund — initiate a full refund of a PAID order. */
export async function refundOrder(
  orderId: string,
  reason: string,
  signal?: AbortSignal,
): Promise<RefundOrderResult> {
  return refundAdminOrder(getAdminApiClient(), orderId, { reason }, { signal });
}
