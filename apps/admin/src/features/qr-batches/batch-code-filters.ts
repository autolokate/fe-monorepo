import type { QrCodeStatus } from '@autolokate/api-client';

export type BatchCodeStatusFilter = QrCodeStatus | 'ALL';

export type BatchCodeStatusFilterOption = {
  value: BatchCodeStatusFilter;
  label: string;
};

/** Common ops filters for `GET /admin/v1/qr-batches/{id}/codes?status=`. */
export const BATCH_CODE_STATUS_FILTERS: BatchCodeStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'MANUFACTURED', label: 'Manufactured' },
  { value: 'PROVISIONED', label: 'Provisioned' },
  { value: 'DISTRIBUTED', label: 'Distributed' },
  { value: 'ATTACHED', label: 'Attached' },
  { value: 'ACTIVATED', label: 'Activated' },
  { value: 'RETIRED', label: 'Retired' },
];
