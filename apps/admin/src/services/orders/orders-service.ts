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

/**
 * POST /admin/v1/orders/{orderId}/refund — FULL refund only. `idempotencyKey` identifies one
 * user-initiated attempt; the caller decides when to reuse or rotate it (see `refund-outcome.ts`).
 */
export async function refundOrder(
  orderId: string,
  reason: string,
  idempotencyKey: string,
): Promise<RefundOrderResult> {
  return refundAdminOrder(getAdminApiClient(), orderId, { reason }, { idempotencyKey });
}
