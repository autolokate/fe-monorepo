import type { AdminOrderStatus } from '@autolokate/api-client';

export type OrdersStatusFilter = AdminOrderStatus | 'ALL';

export type OrdersStatusFilterOption = {
  value: OrdersStatusFilter;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/orders` `status` query parameter. */
export const ORDERS_STATUS_FILTERS: OrdersStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function toOrdersQueryStatus(filter: OrdersStatusFilter): AdminOrderStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
