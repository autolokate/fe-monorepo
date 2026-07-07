import type { QrBatchStatus } from '@autolokate/api-client';

export type InventoryStateFilter = QrBatchStatus | 'ALL';

export type InventoryStateFilterOption = {
  value: InventoryStateFilter;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/inventory` `state` query parameter. */
export const INVENTORY_STATE_FILTERS: InventoryStateFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CODES_GENERATED', label: 'Codes generated' },
  { value: 'PRINTING', label: 'Printing' },
  { value: 'QA', label: 'QA' },
  { value: 'PROVISIONED', label: 'Provisioned' },
  { value: 'REPRINT', label: 'Reprint' },
  { value: 'ALLOCATED', label: 'Allocated' },
  { value: 'IN_DISTRIBUTION', label: 'In distribution' },
  { value: 'DEPLETED', label: 'Depleted' },
  { value: 'SCRAPPED', label: 'Scrapped' },
];

export function toInventoryQueryState(filter: InventoryStateFilter): QrBatchStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}
