import {
  getAdminSubscription,
  listAdminSubscriptions,
  type AdminSubscriptionDetail,
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

/** GET /admin/v1/subscriptions/{subscriptionId} — one subscription with its billing-mandate link. */
export async function fetchSubscriptionDetail(
  subscriptionId: string,
  signal?: AbortSignal,
): Promise<AdminSubscriptionDetail> {
  return getAdminSubscription(getAdminApiClient(), subscriptionId, { signal });
}
