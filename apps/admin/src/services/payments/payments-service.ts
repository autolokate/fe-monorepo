import {
  getAdminPayment,
  listAdminPaymentsPage,
  type AdminPaymentDetail,
  type AdminPaymentsPageResult,
  type ListAdminPaymentsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchPaymentsPage(
  query: ListAdminPaymentsQuery = {},
  signal?: AbortSignal,
): Promise<AdminPaymentsPageResult> {
  return listAdminPaymentsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/payments/{paymentId} — captured amount and FSM sequence. */
export async function fetchPaymentDetail(
  paymentId: string,
  signal?: AbortSignal,
): Promise<AdminPaymentDetail> {
  return getAdminPayment(getAdminApiClient(), paymentId, { signal });
}
