import type { AdminShipmentStatus } from '@autolokate/api-client';

export type ShipmentsStatusFilter = AdminShipmentStatus | 'ALL';

export type ShipmentsStatusFilterOption = {
  value: ShipmentsStatusFilter;
  label: string;
};

/** Nest Admin shipment reads support `PAID` only (CL-BE-11 / CL-FE-3). */
export const SHIPMENTS_STATUS_FILTERS: ShipmentsStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
];

export function toShipmentsQueryStatus(
  filter: ShipmentsStatusFilter,
): AdminShipmentStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
