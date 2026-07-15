import {
  listAdminSubscriptions,
  type AdminSubscriptionSummary,
  type ListAdminSubscriptionsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchSubscriptions(
  query: ListAdminSubscriptionsQuery = {},
  signal?: AbortSignal,
): Promise<AdminSubscriptionSummary[]> {
  return listAdminSubscriptions(getAdminApiClient(), query, { signal });
}
