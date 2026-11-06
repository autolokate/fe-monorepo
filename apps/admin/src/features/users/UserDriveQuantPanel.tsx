import type { AdminUserTripDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { DqChip } from '@/features/drivequant/dq-ui';
import {
  formatIst,
  formatKm,
  formatMinutes,
  formatScore,
  tripSourceStatus,
  vehicleLabel,
  type VehicleIdentity,
} from '@/features/drivequant/driving-status';
import { useUserDriveQuant } from '@/hooks/users/useAdminUserV4';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';

import './users-v4.css';

/** Driver score `source`: verified trips, the app's own trip events, or nothing yet. */
function driverScoreSource(source: string): string {
  switch (source) {
    case 'DRIVEQUANT':
      return 'Verified trips';
    case 'ACCOUNT_TRIPS':
      return 'App trip events (no score)';
    case 'NONE':
      return 'No trips yet';
    default:
      return humanizeAdminLabel(source);
  }
}

/**
 * Trips (server-verified or phone-reported) and the driver score the app shows — for score disputes
 * and crash-event questions. Both reads write a `DRIVER_TRIP_ACCESS` audit row, so they load on
 * request. All times IST.
 */
export function UserDriveQuantPanel({
  userId,
  vehicles = [],
  onOpenTrip,
}: {
  userId: string;
  /** The account's vehicles, to show plates instead of ids. */
  vehicles?: readonly VehicleIdentity[];
  /** Open the trip drawer (audited detail read). */
  onOpenTrip?: (trip: AdminUserTripDto) => void;
}) {
  const [optedIn, setOptedIn] = useState(false);
  const [fromDraft, setFromDraft] = useState('');
  const [toDraft, setToDraft] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const { trips, score } = useUserDriveQuant(userId, range, optedIn);

  const columns = useMemo<ColumnDef<AdminUserTripDto>[]>(
    () => [
      {
        id: 'startedAt',
        header: 'Trip (IST)',
        accessorFn: (row) => row.startedAt ?? row.receivedAt,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span className="admin-v4-stack__primary">{formatIst(row.original.startedAt)}</span>
            <span className="admin-v4-stack__secondary">to {formatIst(row.original.endedAt)}</span>
          </span>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        accessorFn: (row) => vehicleLabel(row.vehicleId, vehicles).primary,
        cell: ({ row }) => {
          const label = vehicleLabel(row.original.vehicleId, vehicles);
          return (
            <span className="admin-v4-stack">
              <span className={label.known ? 'admin-v4-stack__primary' : 'admin-mono'}>
                {label.primary}
              </span>
              {label.secondary ? (
                <span className="admin-v4-stack__secondary">{label.secondary}</span>
              ) : null}
            </span>
          );
        },
      },
      {
        id: 'distanceKm',
        header: 'Distance',
        accessorFn: (row) => row.distanceKm ?? -1,
        cell: ({ row }) => formatKm(row.original.distanceKm),
      },
      {
        id: 'duration',
        header: 'Duration (driving)',
        accessorFn: (row) => row.durationMinutes ?? -1,
        cell: ({ row }) =>
          `${formatMinutes(row.original.durationMinutes)} (${formatMinutes(row.original.drivingDurationMinutes)})`,
      },
      { id: 'safety', header: 'Safety', accessorFn: (row) => formatScore(row.scores.safety) },
      { id: 'eco', header: 'Eco', accessorFn: (row) => formatScore(row.scores.eco) },
      {
        id: 'distraction',
        header: 'Distraction',
        accessorFn: (row) => formatScore(row.scores.distraction),
      },
      {
        id: 'speeding',
        header: 'Speeding',
        accessorFn: (row) => formatScore(row.scores.speeding),
      },
      {
        id: 'source',
        header: 'Source',
        accessorFn: (row) => tripSourceStatus(row.source, row.verified).label,
        cell: ({ row }) => {
          const status = tripSourceStatus(row.original.source, row.original.verified);
          return (
            <span className="admin-v4-stack">
              <DqChip label={status.label} tone={status.tone} />
              <span className="admin-v4-stack__secondary admin-mono" title={row.original.tripId}>
                {shortAdminId(row.original.tripId, 12)}
              </span>
            </span>
          );
        },
      },
    ],
    [vehicles],
  );

  const dq = score.data?.driveQuant;

  return (
    <AdminPanel
      title="Trips & driver score"
      subtitle="Recorded trips and the driver score this account sees in the app. Scores are 0–10."
    >
      <p className="admin-audit-note" data-testid="user-trips-audit-note">
        <span>
          <strong>Viewing writes an audit row.</strong> Loading trips or the driver score (and each
          Load more) is recorded as DRIVER_TRIP_ACCESS against your operator account.
        </span>
      </p>
      {!optedIn ? (
        <div className="admin-v4-gate">
          <AlButton
            size="sm"
            data-testid="user-trips-load"
            onClick={() => {
              setOptedIn(true);
            }}
          >
            Load trips & score
          </AlButton>
        </div>
      ) : trips.notDeployed ? (
        <AdminNotDeployedState
          title="Trips"
          endpoint="GET /admin/v1/users/{userId}/trips"
          description="Trips can't be read on this server yet."
        />
      ) : (
        <>
          {score.error ? (
            <AlErrorState message={score.error} onRetry={score.refresh} />
          ) : score.data ? (
            <div data-testid="user-driver-score">
              <AdminDetailGrid>
                <AdminDetailField label="Driver score" value={formatScore(score.data.score)} />
                <AdminDetailField label="Trips counted" value={String(score.data.tripCount)} />
                <AdminDetailField
                  label="Score basis"
                  value={driverScoreSource(score.data.source)}
                />
                {dq ? (
                  <>
                    <AdminDetailField
                      label={`Window (${String(dq.windowDays)} days)`}
                      value={`${String(dq.windowTripCount)} trips · ${formatKm(dq.windowDistanceKm)}`}
                    />
                    <AdminDetailField
                      label={`Safety / eco (of ${String(dq.scale)})`}
                      value={`${formatScore(dq.safety)} / ${formatScore(dq.eco)}`}
                    />
                    <AdminDetailField
                      label="Distraction / speeding"
                      value={`${formatScore(dq.distraction)} / ${formatScore(dq.speeding)}`}
                    />
                    <AdminDetailField label="Last trip" value={formatIst(dq.lastTripAt)} />
                  </>
                ) : null}
              </AdminDetailGrid>
              {score.data.disclaimer ? (
                <p className="admin-empty-note">{score.data.disclaimer}</p>
              ) : null}
            </div>
          ) : null}

          <form
            className="admin-v4-toolbar admin-v4-subsection"
            onSubmit={(event) => {
              event.preventDefault();
              setRange({ from: fromDraft, to: toDraft });
            }}
          >
            <label className="admin-field">
              From (IST)
              <input
                type="date"
                data-testid="user-trips-from"
                value={fromDraft}
                onChange={(event) => {
                  setFromDraft(event.target.value);
                }}
              />
            </label>
            <label className="admin-field">
              To (IST, inclusive)
              <input
                type="date"
                data-testid="user-trips-to"
                value={toDraft}
                onChange={(event) => {
                  setToDraft(event.target.value);
                }}
              />
            </label>
            <AlButton size="sm" variant="secondary" type="submit" data-testid="user-trips-apply">
              Apply dates
            </AlButton>
          </form>

          {trips.error ? (
            <AlErrorState message={trips.error} onRetry={trips.refresh} />
          ) : (
            <div data-testid="user-trips">
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="user-trips-table"
                columns={columns}
                data={trips.items}
                loading={trips.isLoading}
                enableGlobalSearch={false}
                emptyTitle="No trips"
                emptyDescription="No trips were recorded for this account in this date range."
                getRowId={(row) => row.tripId}
                {...(onOpenTrip ? { onRowClick: onOpenTrip } : {})}
              />
              {onOpenTrip && trips.items.length > 0 ? (
                <p className="admin-muted dq-footnote">
                  Open a trip for its events and detailed metrics (audited read). Transport mode and
                  driver / passenger are shown in the trip.
                </p>
              ) : null}
              <AdminLoadMore
                hasMore={trips.hasMore}
                loading={trips.isFetchingNextPage}
                onLoadMore={trips.loadMore}
                testId="user-trips-load-more"
              />
            </div>
          )}
        </>
      )}
    </AdminPanel>
  );
}
