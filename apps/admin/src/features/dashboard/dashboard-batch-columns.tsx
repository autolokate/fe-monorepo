import type { BatchSummaryDto } from '@autolokate/api-client';
import { AlStatusBadge, type ColumnDef } from '@autolokate/ui';

import { batchStatusTone } from '@/platform/utils/batch-status.js';

export const dashboardBatchColumns: ColumnDef<BatchSummaryDto>[] = [
  {
    accessorKey: 'batchCode',
    header: 'Batch',
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <AlStatusBadge label={row.original.status} status={batchStatusTone(row.original.status)} />
    ),
  },
  {
    accessorKey: 'totalCount',
    header: 'Total',
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
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
];
