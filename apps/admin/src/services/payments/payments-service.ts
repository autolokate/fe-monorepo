import {
  listAdminPaymentsPage,
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
