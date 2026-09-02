import type { BatchSummaryDto } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';

import { BatchStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatShortDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const dashboardBatchColumns: ColumnDef<BatchSummaryDto>[] = [
  {
    accessorKey: 'batchCode',
    header: 'Batch code',
    cell: ({ row }) => (
      <span className="admin-table-primary-cell" title={row.original.batchCode}>
        {row.original.batchCode}
      </span>
    ),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <BatchStatusBadge status={row.original.status} />,
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
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
];
