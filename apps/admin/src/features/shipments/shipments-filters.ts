import type { AdminShipmentStatus } from '@autolokate/api-client';

export type ShipmentsStatusFilter = AdminShipmentStatus | 'ALL';

export type ShipmentsStatusFilterOption = {
  value: ShipmentsStatusFilter;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/shipments` `status` query parameter (the fulfilment FSM). */
export const SHIPMENTS_STATUS_FILTERS: ShipmentsStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'ALLOCATED', label: 'Allocated' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'LOST', label: 'Lost' },
];

export function toShipmentsQueryStatus(
  filter: ShipmentsStatusFilter,
): AdminShipmentStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
