import type { AdminDqUserCrashDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminSosIncidentPath } from '@/app/routes/admin-paths';
import {
  dqCrashStateMeta,
  formatDqNumber,
  formatDqProbability,
} from '@/features/drivequant/drivequant-model';
import { DqChip, DqErrorBlock } from '@/features/drivequant/dq-ui';
import { useUserCrashes } from '@/hooks/drivequant/useDriveQuantTelemetry';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminPanel, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

/**
 * The account's DriveQuant crashes (no location — that lives on the SOS incident). Audited
 * `DRIVER_TRIP_ACCESS`, so it loads on request.
 */
export function UserCrashesPanel({
  userId,
  onOpenTrip,
}: {
  userId: string;
  onOpenTrip: (tripId: string) => void;
}) {
  const [optedIn, setOptedIn] = useState(false);
  const crashes = useUserCrashes(userId, optedIn);
  const canViewSos = useAdminPermission('sos:view');

  const columns = useMemo<ColumnDef<AdminDqUserCrashDto>[]>(
    () => [
      {
        id: 'crashAt',
        header: 'Crash',
        accessorFn: (row) => row.crashAt ?? row.receivedAt,
        cell: ({ row }) => formatAdminDateTime(row.original.crashAt ?? row.original.receivedAt),
      },
      {
        id: 'state',
        header: 'State',
        accessorFn: (row) => row.state,
        cell: ({ row }) => {
          const meta = dqCrashStateMeta(row.original.state);
          return <DqChip label={meta.label} tone={meta.tone} />;
        },
      },
      {
        id: 'probability',
        header: 'Probability',
        accessorFn: (row) => formatDqProbability(row.probability),
      },
      {
        id: 'outcome',
        header: 'Outcome',
        accessorFn: (row) => humanizeAdminLabel(row.outcome),
      },
      {
        id: 'velocity',
        header: 'Impact speed',
        accessorFn: (row) =>
          row.velocityKmh === null ? '—' : `${formatDqNumber(row.velocityKmh, 1)} km/h`,
      },
      {
        id: 'sensors',
        header: 'Sensor data',
        accessorFn: (row) => (row.hasSensorData ? 'GPS + IMU' : 'None'),
      },
      {
        id: 'links',
        header: 'Linked',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="dq-links">
            {row.original.dqTripId ? (
              <button
                type="button"
                className="admin-link dq-link-button"
                data-testid="dq-crash-open-trip"
                onClick={() => {
                  if (row.original.dqTripId) onOpenTrip(row.original.dqTripId);
                }}
              >
                Trip
              </button>
            ) : null}
            {row.original.incidentId && canViewSos ? (
              <Link className="admin-link" to={adminSosIncidentPath(row.original.incidentId)}>
                SOS incident
              </Link>
            ) : null}
            {!row.original.dqTripId && !row.original.incidentId ? '—' : null}
          </span>
        ),
      },
    ],
    [canViewSos, onOpenTrip],
  );

  return (
    <AdminPanel
      title="Crashes"
      subtitle="DriveQuant crash detections for this account. Locations stay on the SOS incident."
    >
      {!optedIn ? (
        <div className="admin-v4-gate">
          <AlButton
            size="sm"
            data-testid="user-crashes-load"
            onClick={() => {
              setOptedIn(true);
            }}
          >
            Load crashes
          </AlButton>
          <span className="admin-muted">Recorded as DRIVER_TRIP_ACCESS.</span>
        </div>
      ) : crashes.notDeployed ? (
        <AdminNotDeployedState
          title="DriveQuant crashes"
          endpoint="GET /admin/v1/users/{userId}/crashes"
          description="Crashes can't be read on this server yet."
        />
      ) : crashes.error ? (
        <DqErrorBlock error={crashes.error} onRetry={crashes.refetch} />
      ) : (
        <div data-testid="user-crashes">
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="user-crashes-table"
            columns={columns}
            data={crashes.data ?? []}
            loading={crashes.isLoading}
            enableGlobalSearch={false}
            emptyTitle="No crashes"
            emptyDescription="DriveQuant has reported no crash for this account."
            getRowId={(row) => row.crashId}
          />
        </div>
      )}
    </AdminPanel>
  );
}
