import type { AdminSubscriptionSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { SubscriptionStatusBadge } from '@/platform/components/EntityStatusBadge';

/** Show only the leading segment of a uuid — enough to eyeball a row without dumping the full id. */
function shortId(id: string): string {
  return id.split('-')[0] ?? id;
}

function formatActivatedVia(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—';
}

export function useSubscriptionsColumns(): ColumnDef<AdminSubscriptionSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'planTier',
        header: 'Plan',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <SubscriptionStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'vehicleId',
        header: 'Vehicle',
        cell: ({ row }) => shortId(row.original.vehicleId),
      },
      {
        accessorKey: 'activatedVia',
        header: 'Activated via',
        cell: ({ row }) => formatActivatedVia(row.original.activatedVia),
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
