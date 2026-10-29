import type { AdminIncidentSummary } from '@autolokate/api-client';
import { AlButton, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { IncidentStatusBadge } from '@/platform/components/EntityStatusBadge';
import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

/** QR or vehicle bound to the incident — short secondary refs only. */
function accountCode(incident: AdminIncidentSummary): string {
  if (incident.qrCodeId) {
    return `QR ${shortAdminId(incident.qrCodeId)}`;
  }
  if (incident.vehicleId) {
    return `Vehicle ${shortAdminId(incident.vehicleId)}`;
  }
  return '—';
}

export type IncidentsColumnHandlers = {
  /** Prefills the break-glass detail incident field. */
  onRequestDetailGrant?: (incidentId: string) => void;
};

export function useIncidentsColumns(
  handlers: IncidentsColumnHandlers = {},
): ColumnDef<AdminIncidentSummary>[] {
  const { onRequestDetailGrant } = handlers;

  return useMemo(
    () => [
      {
        id: 'incident',
        header: 'Incident',
        accessorFn: (row) => row.source,
        cell: ({ row }) => (
          <div className="admin-primary-cell">
            <span className="admin-primary-cell__title">
              {humanizeAdminLabel(row.original.source)}
            </span>
            <AlText
              className="admin-primary-cell__meta"
              variant="mono"
              tone="muted"
              title={row.original.incidentId}
            >
              {shortAdminId(row.original.incidentId)}
            </AlText>
          </div>
        ),
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
        accessorKey: 'openedAt',
        header: 'Opened',
        cell: ({ row }) => formatDateTime(row.original.openedAt),
      },
      ...(onRequestDetailGrant
        ? [
            {
              id: 'detailGrant',
              header: 'Detail',
              cell: ({ row }: { row: { original: AdminIncidentSummary } }) => (
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid={`incident-detail-grant-${row.original.incidentId}`}
                  onClick={() => {
                    onRequestDetailGrant(row.original.incidentId);
                  }}
                >
                  Prefill detail grant
                </AlButton>
              ),
            } satisfies ColumnDef<AdminIncidentSummary>,
          ]
        : []),
    ],
    [onRequestDetailGrant],
  );
}
