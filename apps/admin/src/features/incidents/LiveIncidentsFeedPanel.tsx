import { AlDataTable, AlText, type ColumnDef } from '@autolokate/ui';
import type { AdminIncidentFeedItem } from '@autolokate/api-client';

import { INCIDENT_FEED_POLL_MS, useIncidentFeed } from '@/hooks/incidents/useIncidentFeed';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import {
  AdminPanel,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { IncidentStatusBadge } from '@/platform/components/EntityStatusBadge';

const COLUMNS: ColumnDef<AdminIncidentFeedItem>[] = [
  {
    accessorKey: 'incidentId',
    header: 'Incident',
    cell: ({ row }) => shortAdminId(row.original.incidentId),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <IncidentStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => humanizeAdminLabel(row.original.source),
  },
  {
    accessorKey: 'dispatchPath',
    header: 'Dispatch',
    cell: ({ row }) =>
      row.original.dispatchPath ? humanizeAdminLabel(row.original.dispatchPath) : '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
];

/**
 * Live, PII-free incident feed (ids, status, source, dispatch path). Polls while the tab is visible
 * and needs no break-glass approval; opening an incident's details still goes through dual control.
 */
export function LiveIncidentsFeedPanel() {
  const { rows, lastPolledAt, errorMessage, notDeployed, isLoading } = useIncidentFeed();

  if (notDeployed) {
    return (
      <AdminNotDeployedState title="Live incident feed" endpoint="GET /admin/v1/incidents/feed" />
    );
  }

  return (
    <AdminPanel
      title="Live incident feed"
      subtitle={`No personal data. Refreshes every ${String(INCIDENT_FEED_POLL_MS / 1000)}s while this tab is visible.`}
    >
      <AlText variant="caption" tone="muted" data-testid="incidents-feed-status">
        {errorMessage
          ? `Feed paused: ${errorMessage} Retrying automatically.`
          : lastPolledAt
            ? `Last checked ${new Date(lastPolledAt).toLocaleTimeString()} (server time).`
            : 'Connecting…'}
      </AlText>
      <AlDataTable
        {...ADMIN_LIST_TABLE_PROPS}
        tableId="incidents-live-feed"
        columns={COLUMNS}
        data={rows}
        loading={isLoading}
        emptyTitle="No recent incidents"
        emptyDescription="Nothing reported or updated in the last 24 hours."
        getRowId={(row) => row.incidentId}
      />
    </AdminPanel>
  );
}
