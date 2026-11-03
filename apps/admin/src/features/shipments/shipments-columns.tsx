import type { AdminShipmentSummary } from '@autolokate/api-client';
import { AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { ShipmentStatusBadge } from '@/platform/components/EntityStatusBadge';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

function formatDateTime(value: string | null): string {
  return value ? formatAdminDateTime(value) : '—';
}

/** Read-only columns: shipments are a projection of paid retail orders (no status-update route). */
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
        accessorKey: 'allocatedQrCode',
        header: 'QR code',
        cell: ({ row }) =>
          row.original.allocatedQrCode ? (
            <AlText as="span" variant="mono">
              {row.original.allocatedQrCode}
            </AlText>
          ) : (
            '—'
          ),
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
