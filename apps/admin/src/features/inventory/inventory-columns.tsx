import type { BatchSummaryDto } from '@autolokate/api-client';
import { AlStatusBadge, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { batchStatusTone } from '@/platform/utils/batch-status';

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function useInventoryColumns(): ColumnDef<BatchSummaryDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'batchCode',
        header: 'Batch code',
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
      },
      {
        accessorKey: 'totalCount',
        header: 'Total QR',
        cell: ({ row }) => row.original.totalCount.toLocaleString(),
      },
      {
        accessorKey: 'provisionedCount',
        header: 'Provisioned',
        cell: ({ row }) => row.original.provisionedCount.toLocaleString(),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AlStatusBadge label={row.original.status} status={batchStatusTone(row.original.status)} />
        ),
      },
    ],
    [],
  );
}
