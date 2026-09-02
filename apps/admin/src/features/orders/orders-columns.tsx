import type { AdminOrderSummary } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { OrderStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatInr(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export type UseOrdersColumnsOptions = {
  /** Whether the signed-in admin may issue refunds (`orders:refund`). Off in read-only reuses. */
  canRefund?: boolean;
  /** Open the refund confirmation for a PAID order. Omit to hide the refund action entirely. */
  onRefund?: (order: AdminOrderSummary) => void;
};

export function useOrdersColumns({
  canRefund = false,
  onRefund,
}: UseOrdersColumnsOptions = {}): ColumnDef<AdminOrderSummary>[] {
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
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canRefund && onRefund && row.original.status === 'PAID' ? (
            <AlButton
              size="sm"
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                onRefund(row.original);
              }}
            >
              Refund
            </AlButton>
          ) : null,
      },
    ],
    [canRefund, onRefund],
  );
}
