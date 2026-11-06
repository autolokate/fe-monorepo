import type { AdminDqUserCrashDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminSosIncidentPath } from '@/app/routes/admin-paths';
import { DqChip, DqErrorBlock } from '@/features/drivequant/dq-ui';
import {
  countCrashes,
  CRASH_FILTER_OPTIONS,
  crashConsentStatus,
  crashEntitlementStatus,
  crashOutcomeStatus,
  crashStateStatus,
  formatIst,
  formatKmh,
  formatProbability,
  matchesCrashFilter,
  vehicleAttributionStatus,
  vehicleLabel,
  type CrashFilter,
  type VehicleIdentity,
} from '@/features/drivequant/driving-status';
import { useUserCrashes } from '@/hooks/drivequant/useDriveQuantTelemetry';
import { AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip, AdminPanel } from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

/**
 * The account's crash events (no location — that lives on the SOS incident). Audited
 * `DRIVER_TRIP_ACCESS`, so it loads on request. Needs-review events (the detector could not
 * classify them; never auto-escalated) and consent / plan gaps are filterable.
 */
export function UserCrashesPanel({
  userId,
  vehicles = [],
  onOpenTrip,
}: {
  userId: string;
  vehicles?: readonly VehicleIdentity[];
  onOpenTrip: (tripId: string) => void;
}) {
  const [optedIn, setOptedIn] = useState(false);
  const [filter, setFilter] = useState<CrashFilter>('ALL');
  const crashes = useUserCrashes(userId, optedIn);
  const canViewSos = useAdminPermission('sos:view');
  const rows = useMemo(() => crashes.data ?? [], [crashes.data]);
  const counts = useMemo(() => countCrashes(rows), [rows]);
  const visible = useMemo(
    () => rows.filter((row) => matchesCrashFilter(row, filter)),
    [rows, filter],
  );

  const columns = useMemo<ColumnDef<AdminDqUserCrashDto>[]>(
    () => [
      {
        id: 'crashAt',
        header: 'When (IST)',
        accessorFn: (row) => row.crashAt ?? row.receivedAt,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span className="admin-v4-stack__primary">
              {formatIst(row.original.crashAt ?? row.original.receivedAt)}
            </span>
            {!row.original.crashAt ? (
              <span className="admin-v4-stack__secondary">received (no event time)</span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'state',
        header: 'Status',
        accessorFn: (row) => crashStateStatus(row.state).label,
        cell: ({ row }) => {
          const state = crashStateStatus(row.original.state);
          const outcome = crashOutcomeStatus(row.original.outcome, row.original.state);
          return (
            <span className="dq-status-stack" data-testid="dq-crash-status">
              <span title={state.hint}>
                <DqChip label={state.label} tone={state.tone} />
              </span>
              <span className="admin-v4-stack__secondary" title={outcome.hint}>
                {outcome.label}
              </span>
            </span>
          );
        },
      },
      {
        id: 'probability',
        header: 'Probability',
        accessorFn: (row) => row.probability ?? -1,
        cell: ({ row }) => (
          <span className="ax-num">{formatProbability(row.original.probability)}</span>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        accessorFn: (row) => vehicleLabel(row.vehicleId, vehicles).primary,
        cell: ({ row }) => {
          const label = vehicleLabel(row.original.vehicleId, vehicles);
          const attribution = vehicleAttributionStatus(row.original.vehicleAttribution);
          return (
            <span className="admin-v4-stack">
              <span className={label.known ? 'admin-v4-stack__primary' : 'admin-mono'}>
                {label.primary}
              </span>
              {row.original.vehicleId ? (
                attribution.guess ? (
                  <DqChip label={attribution.label} tone={attribution.tone} />
                ) : (
                  <span className="admin-v4-stack__secondary">{attribution.label}</span>
                )
              ) : null}
            </span>
          );
        },
      },
      {
        id: 'speed',
        header: 'Impact speed',
        accessorFn: (row) => row.velocityKmh ?? -1,
        cell: ({ row }) => <span className="ax-num">{formatKmh(row.original.velocityKmh)}</span>,
      },
      {
        id: 'plan',
        header: 'Plan / consent',
        enableSorting: false,
        cell: ({ row }) => {
          const plan = crashEntitlementStatus(row.original);
          const consent = crashConsentStatus(row.original);
          return (
            <span className="dq-status-stack" data-testid="dq-crash-flags">
              <span title={plan.hint}>
                <DqChip label={plan.label} tone={plan.tone} />
              </span>
              <span title={consent.hint}>
                <DqChip label={consent.label} tone={consent.tone} />
              </span>
            </span>
          );
        },
      },
      {
        id: 'links',
        header: 'Investigate',
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
            {!row.original.dqTripId && !row.original.incidentId ? (
              <span className="admin-muted">
                {row.original.hasSensorData ? 'Sensor data only' : '—'}
              </span>
            ) : null}
          </span>
        ),
      },
    ],
    [canViewSos, onOpenTrip, vehicles],
  );

  return (
    <AdminPanel
      title="Crash Events"
      subtitle="Possible crashes detected on this account’s drives. Locations and sensor data stay on the SOS incident."
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
            Load crash events
          </AlButton>
          <span className="admin-muted">Recorded as DRIVER_TRIP_ACCESS.</span>
        </div>
      ) : crashes.notDeployed ? (
        <AdminNotDeployedState
          title="Crash events"
          endpoint="GET /admin/v1/users/{userId}/crashes"
          description="Crash events can't be read on this server yet."
        />
      ) : crashes.error ? (
        <DqErrorBlock error={crashes.error} onRetry={crashes.refetch} />
      ) : (
        <div data-testid="user-crashes">
          {rows.length > 0 ? (
            <AdminKpiStrip
              items={[
                { label: 'Crash events', value: String(counts.total) },
                { label: 'Needs review', value: String(counts.needsReview) },
                { label: 'Confirmed', value: String(counts.confirmed) },
                { label: 'Consent / plan gap', value: String(counts.flagged) },
              ]}
            />
          ) : null}
          {rows.length > 0 ? (
            <div className="dq-filters">
              <AdminFilterField label="Show">
                <AdminFilterChips
                  options={CRASH_FILTER_OPTIONS}
                  value={filter}
                  onChange={setFilter}
                  aria-label="Crash status"
                />
              </AdminFilterField>
            </div>
          ) : null}
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="user-crashes-table"
            columns={columns}
            data={visible}
            loading={crashes.isLoading}
            enableGlobalSearch={false}
            emptyTitle={rows.length === 0 ? 'No crash events' : 'No events match'}
            emptyDescription={
              rows.length === 0
                ? 'No possible crash has been detected for this account.'
                : 'Try another filter.'
            }
            getRowId={(row) => row.crashId}
          />
        </div>
      )}
    </AdminPanel>
  );
}
