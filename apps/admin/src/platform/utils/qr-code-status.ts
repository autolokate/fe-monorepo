import type { QrCodeStatus } from '@autolokate/api-client';
import type { AlStatusBadgeProps } from '@autolokate/ui';

export function qrCodeStatusTone(status: QrCodeStatus): AlStatusBadgeProps['status'] {
  switch (status) {
    case 'PROVISIONED':
    case 'DISTRIBUTED':
    case 'ACTIVATED':
      return 'active';
    case 'MANUFACTURED':
    case 'ATTACHED':
    case 'ATTACHED_UNPAID':
    case 'TRANSFERRED':
      return 'pending';
    case 'LAPSED':
    case 'CANCELLED':
    case 'REPLACED_LOST':
    case 'RETIRED':
      return 'inactive';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
