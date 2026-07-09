import type { AdminPromoDto } from '@autolokate/api-client';
import { AlStatusBadge, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import {
  formatPromoDiscount,
  getPromoLifecycleStatus,
} from '@/services/promos/promo-metrics';

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function lifecycleTone(status: ReturnType<typeof getPromoLifecycleStatus>): 'active' | 'pending' | 'inactive' {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'UPCOMING':
      return 'pending';
    case 'EXPIRED':
    case 'INACTIVE':
      return 'inactive';
    default:
      return 'inactive';
  }
}

export function usePromoColumns(): ColumnDef<AdminPromoDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
      },
      {
        id: 'discount',
        header: 'Discount',
        accessorFn: (row) => formatPromoDiscount(row),
        cell: ({ row }) => formatPromoDiscount(row.original),
      },
      {
        accessorKey: 'validFrom',
        header: 'Valid from',
        cell: ({ row }) => formatDateTime(row.original.validFrom),
      },
      {
        accessorKey: 'validTo',
        header: 'Valid to',
        cell: ({ row }) => formatDateTime(row.original.validTo),
      },
      {
        id: 'lifecycle',
        header: 'Status',
        accessorFn: (row) => getPromoLifecycleStatus(row),
        cell: ({ row }) => {
          const status = getPromoLifecycleStatus(row.original);
          return <AlStatusBadge label={status} status={lifecycleTone(status)} />;
        },
      },
    ],
    [],
  );
}
