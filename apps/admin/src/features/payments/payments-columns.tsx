import type { AdminPaymentSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { PaymentOutcomeBadge } from '@/platform/components/EntityStatusBadge';

function formatInr(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function usePaymentsColumns(): ColumnDef<AdminPaymentSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order #',
        cell: ({ row }) => row.original.orderNumber ?? '—',
      },
      {
        accessorKey: 'ref',
        header: 'Ref',
      },
      {
        accessorKey: 'mode',
        header: 'Mode',
      },
      {
        accessorKey: 'outcome',
        header: 'Outcome',
        cell: ({ row }) => <PaymentOutcomeBadge outcome={row.original.outcome} />,
      },
      {
        accessorKey: 'amountPaise',
        header: 'Amount',
        cell: ({ row }) => formatInr(row.original.amountPaise),
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
