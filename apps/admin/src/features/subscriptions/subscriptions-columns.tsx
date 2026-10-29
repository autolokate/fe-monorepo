import type { AdminSubscriptionSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { SubscriptionStatusBadge } from '@/platform/components/EntityStatusBadge';
import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';

function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—';
}

/**
 * Coverage list has vehicle id only (no plate/display on the summary row).
 * Product title primary; short id mono secondary.
 */
function VehicleCell({ vehicleId }: { vehicleId: string }) {
  return (
    <div className="admin-primary-cell">
      <span className="admin-primary-cell__title">Vehicle</span>
      <span className="admin-id-secondary" title={vehicleId}>
        {shortAdminId(vehicleId)}
      </span>
    </div>
  );
}

export function useSubscriptionsColumns(): ColumnDef<AdminSubscriptionSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'planTier',
        header: 'Plan',
        cell: ({ row }) => humanizeAdminLabel(row.original.planTier),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <SubscriptionStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'vehicleId',
        header: 'Vehicle',
        cell: ({ row }) => <VehicleCell vehicleId={row.original.vehicleId} />,
      },
      {
        accessorKey: 'activatedVia',
        header: 'Activated via',
        cell: ({ row }) => humanizeAdminLabel(row.original.activatedVia),
      },
      {
        accessorKey: 'autoRenew',
        header: 'Auto-renew',
        cell: ({ row }) => (row.original.autoRenew ? 'On' : 'Off'),
      },
      {
        accessorKey: 'startedAt',
        header: 'Started',
        cell: ({ row }) => formatDateTime(row.original.startedAt),
      },
    ],
    [],
  );
}
