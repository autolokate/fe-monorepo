import type { AdminIncidentSummary } from '@autolokate/api-client';
import type { ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { IncidentStatusBadge } from '@/platform/components/EntityStatusBadge';

/** Show only the leading segment of a uuid — enough to eyeball a row without dumping the full id. */
function shortId(id: string): string {
  return id.split('-')[0] ?? id;
}

function formatSource(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

/** The QR code or vehicle the incident coalesced on — whichever is bound (both are cross-domain refs). */
function accountCode(incident: AdminIncidentSummary): string {
  if (incident.qrCodeId) {
    return `QR ${shortId(incident.qrCodeId)}`;
  }
  if (incident.vehicleId) {
    return `Vehicle ${shortId(incident.vehicleId)}`;
  }
  return '—';
}

export function useIncidentsColumns(): ColumnDef<AdminIncidentSummary>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'incidentId',
        header: 'Incident',
        cell: ({ row }) => shortId(row.original.incidentId),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <IncidentStatusBadge status={row.original.status} />,
      },
      {
        id: 'accountCode',
        header: 'Account / Code',
        cell: ({ row }) => accountCode(row.original),
      },
      {
        accessorKey: 'source',
        header: 'Kind',
        cell: ({ row }) => formatSource(row.original.source),
      },
      {
        accessorKey: 'openedAt',
        header: 'Created',
        cell: ({ row }) => formatDateTime(row.original.openedAt),
      },
    ],
    [],
  );
}
