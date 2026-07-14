import type { BatchCodeDto } from '@autolokate/api-client';
import { AlText } from '@autolokate/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { QrCodeStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function useBatchCodeColumns(): ColumnDef<BatchCodeDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <AlText as="span" variant="mono">
            {row.original.code}
          </AlText>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <QrCodeStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'activatedAt',
        header: 'Activated',
        cell: ({ row }) => formatDateTime(row.original.activatedAt),
      },
      {
        accessorKey: 'retiredAt',
        header: 'Retired',
        cell: ({ row }) => formatDateTime(row.original.retiredAt),
      },
    ],
    [],
  );
}
