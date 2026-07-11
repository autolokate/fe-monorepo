import type { BatchSummaryDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { BatchStatusBadge } from '@/platform/components/EntityStatusBadge';

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
        cell: ({ row }) => <BatchStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );
}
