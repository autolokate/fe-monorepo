import {
  listAdminOrdersPage,
  type AdminOrdersPageResult,
  type ListAdminOrdersQuery,
  type RefundOrderResult,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

export async function fetchOrdersPage(
  query: ListAdminOrdersQuery = {},
  signal?: AbortSignal,
): Promise<AdminOrdersPageResult> {
  return listAdminOrdersPage(getAdminApiClient(), query, { signal });
}

/**
 * POST /admin/v1/orders/{orderId}/refund — G0-4 Absent (not on Nest Dev OA).
 * Fail closed; do not call the network.
 */
export function refundOrder(
  _orderId: string,
  _reason: string,
  _signal?: AbortSignal,
): Promise<RefundOrderResult> {
  throwAdminProductBlocked('POST /admin/v1/orders/{orderId}/refund');
}
