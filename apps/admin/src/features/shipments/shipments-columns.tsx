import type { AdminShipmentSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { ShipmentStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—';
}

export function useShipmentsColumns(): ColumnDef<AdminShipmentSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order #',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'courier',
        header: 'Courier',
        cell: ({ row }) => row.original.courier ?? '—',
      },
      {
        accessorKey: 'awbNo',
        header: 'AWB',
        cell: ({ row }) => row.original.awbNo ?? '—',
      },
      {
        accessorKey: 'maskedPincode',
        header: 'Pincode',
      },
      {
        accessorKey: 'shippedAt',
        header: 'Shipped',
        cell: ({ row }) => formatDateTime(row.original.shippedAt),
      },
      {
        accessorKey: 'deliveredAt',
        header: 'Delivered',
        cell: ({ row }) => formatDateTime(row.original.deliveredAt),
      },
    ],
    [],
  );
}
