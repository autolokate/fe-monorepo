import type { AdminUserTripDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { useUserDriveQuant } from '@/hooks/users/useAdminUserV4';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './users-v4.css';

function num(value: number | null | undefined, digits = 1): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function minutes(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const total = Math.round(value);
  return total >= 60
    ? `${String(Math.floor(total / 60))} h ${String(total % 60)} min`
    : `${String(total)} min`;
}

/**
 * DriveQuant trips (push / pull / client) and the driver score the app shows — for score disputes and
 * crash-alert questions. Both reads write a `DRIVER_TRIP_ACCESS` audit row, so they load on request.
 */
export function UserDriveQuantPanel({ userId }: { userId: string }) {
  const [optedIn, setOptedIn] = useState(false);
  const [fromDraft, setFromDraft] = useState('');
  const [toDraft, setToDraft] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const { trips, score } = useUserDriveQuant(userId, range, optedIn);

  const columns = useMemo<ColumnDef<AdminUserTripDto>[]>(
    () => [
      {
        id: 'startedAt',
        header: 'Trip',
        accessorFn: (row) => row.startedAt ?? row.receivedAt,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span className="admin-v4-stack__primary">
              {formatAdminDateTime(row.original.startedAt)}
            </span>
            <span className="admin-v4-stack__secondary">
              to {formatAdminDateTime(row.original.endedAt)}
            </span>
          </span>
        ),
      },
      {
        id: 'distanceKm',
        header: 'Distance',
        accessorFn: (row) => row.distanceKm ?? -1,
        cell: ({ row }) =>
          row.original.distanceKm === null ? '—' : `${num(row.original.distanceKm)} km`,
      },
      {
        id: 'duration',
        header: 'Duration (driving)',
        accessorFn: (row) => row.durationMinutes ?? -1,
        cell: ({ row }) =>
          `${minutes(row.original.durationMinutes)} (${minutes(row.original.drivingDurationMinutes)})`,
      },
      { id: 'safety', header: 'Safety', accessorFn: (row) => num(row.scores.safety) },
      { id: 'eco', header: 'Eco', accessorFn: (row) => num(row.scores.eco) },
      {
        id: 'distraction',
        header: 'Distraction',
        accessorFn: (row) => num(row.scores.distraction),
      },
      { id: 'speeding', header: 'Speeding', accessorFn: (row) => num(row.scores.speeding) },
      {
        id: 'verified',
        header: 'Verified',
        accessorFn: (row) => (row.verified ? 'Yes' : 'No'),
        cell: ({ row }) => (
          <AdminStatusChip
            label={row.original.verified ? 'Verified' : 'Unverified'}
            tone={row.original.verified ? 'active' : 'none'}
          />
        ),
      },
      {
        id: 'source',
        header: 'Source',
        accessorFn: (row) => row.source,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span>{humanizeAdminLabel(row.original.source)}</span>
            <span className="admin-v4-stack__secondary admin-mono" title={row.original.tripId}>
              {shortAdminId(row.original.tripId, 12)}
            </span>
          </span>
        ),
      },
    ],
    [],
  );

  const dq = score.data?.driveQuant;

  return (
    <AdminPanel
      title="DriveQuant trips & score"
      subtitle="Trips received from DriveQuant and the driver score this account sees."
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
          title="DriveQuant trips"
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
                <AdminDetailField label="Driver score" value={num(score.data.score)} />
                <AdminDetailField label="Trips counted" value={String(score.data.tripCount)} />
                <AdminDetailField label="Source" value={humanizeAdminLabel(score.data.source)} />
                {dq ? (
                  <>
                    <AdminDetailField
                      label={`Window (${String(dq.windowDays)} days)`}
                      value={`${String(dq.windowTripCount)} trips · ${num(dq.windowDistanceKm)} km`}
                    />
                    <AdminDetailField
                      label={`Safety / eco (of ${String(dq.scale)})`}
                      value={`${num(dq.safety)} / ${num(dq.eco)}`}
                    />
                    <AdminDetailField
                      label="Distraction / speeding"
                      value={`${num(dq.distraction)} / ${num(dq.speeding)}`}
                    />
                    <AdminDetailField
                      label="Last trip"
                      value={formatAdminDateTime(dq.lastTripAt)}
                    />
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
              From
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
              To
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
                emptyDescription="No DriveQuant trips for this account in this range."
                getRowId={(row) => row.tripId}
              />
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
