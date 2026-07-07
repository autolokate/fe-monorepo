import type { QrBatchStatus } from '@autolokate/api-client';
import type { AlStatusBadgeProps } from '@autolokate/ui';

export function batchStatusTone(status: QrBatchStatus): AlStatusBadgeProps['status'] {
  switch (status) {
    case 'PROVISIONED':
    case 'IN_DISTRIBUTION':
    case 'ALLOCATED':
      return 'active';
    case 'DRAFT':
    case 'CODES_GENERATED':
    case 'PRINTING':
    case 'QA':
    case 'REPRINT':
      return 'pending';
    case 'DEPLETED':
    case 'SCRAPPED':
      return 'inactive';
    default:
      return 'inactive';
  }
}
