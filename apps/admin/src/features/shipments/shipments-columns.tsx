import type { AdminShipmentSummary } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { forwardStatuses } from '@/features/shipments/MarkShipmentStatusDialog';
import { ShipmentStatusBadge } from '@/platform/components/EntityStatusBadge';

function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—';
}

export type UseShipmentsColumnsOptions = {
  /** Whether the signed-in admin may mark milestones (`shipments:update`). Off hides the action column. */
  canUpdate?: boolean;
  /** Open the mark-status dialog for a non-terminal shipment. */
  onUpdateStatus?: (shipment: AdminShipmentSummary) => void;
};

export function useShipmentsColumns({
  canUpdate = false,
  onUpdateStatus,
}: UseShipmentsColumnsOptions = {}): ColumnDef<AdminShipmentSummary>[] {
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
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canUpdate && onUpdateStatus && forwardStatuses(row.original.status).length > 0 ? (
            <AlButton
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                onUpdateStatus(row.original);
              }}
            >
              Update status
            </AlButton>
          ) : null,
      },
    ],
    [canUpdate, onUpdateStatus],
  );
}
