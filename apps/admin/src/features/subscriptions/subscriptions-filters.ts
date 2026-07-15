import type { AdminSubscriptionStatus } from '@autolokate/api-client';

export type SubscriptionsStatusFilter = AdminSubscriptionStatus | 'ALL';

export type SubscriptionsStatusFilterOption = {
  value: SubscriptionsStatusFilter;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/subscriptions` `status` query parameter. */
export const SUBSCRIPTIONS_STATUS_FILTERS: SubscriptionsStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LAPSED', label: 'Lapsed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export function toSubscriptionsQueryStatus(
  filter: SubscriptionsStatusFilter,
): AdminSubscriptionStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
