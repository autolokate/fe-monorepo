import type { AdminOrderSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { OrderStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatInr(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function useOrdersColumns(): ColumnDef<AdminOrderSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order #',
      },
      {
        accessorKey: 'orderKind',
        header: 'Kind',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'planName',
        header: 'Plan',
      },
      {
        accessorKey: 'totalPaise',
        header: 'Amount',
        cell: ({ row }) => formatInr(row.original.totalPaise),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );
}
