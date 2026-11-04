import type { AdminSosSummary } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { BellRing, Volume2, VolumeX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminSosIncidentPath } from '@/app/routes/admin-paths';
import { sosErrorView } from '@/features/sos/sos-errors';
import { SOS_POLL_MS } from '@/features/sos/sos-list-sync';
import {
  countSosIncidents,
  filterSosIncidents,
  formatSosElapsed,
  isSosTerminal,
  sosActivationReason,
  sosCallOutcome,
  SOS_SCOPE_VALUES,
  SOS_TRIGGER_VALUES,
  type SosFilterScope,
  type SosTriggerFilter,
} from '@/features/sos/sos-model';
import { SosPhoneLink, SosStateBadge, SosTriggerBadge, SosUrgentFlag } from '@/features/sos/sos-ui';
import { useNow, useSosIncidents } from '@/hooks/sos/useSosIncidents';
import { useSosNewIncidentCue, type SosSoundState } from '@/hooks/sos/useSosNewIncidentCue';
import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './sos.css';

const SCOPE_OPTIONS: { value: SosFilterScope; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'NEEDS_ACTION', label: 'Needs action' },
  { value: 'CALLING', label: 'Calling user' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ALL', label: 'All' },
];

const TRIGGER_OPTIONS: { value: SosTriggerFilter; label: string }[] = [
  { value: 'ANY', label: 'SOS + crash' },
  { value: 'SOS', label: 'SOS' },
  { value: 'CRASH', label: 'Crash' },
];

function SoundToggle({ state, onToggle }: { state: SosSoundState; onToggle: () => void }) {
  const label =
    state === 'on' ? 'Sound on' : state === 'blocked' ? 'Click to allow sound' : 'Sound off';
  return (
    <AlButton
      size="sm"
      variant={state === 'on' ? 'secondary' : 'outline'}
      icon={state === 'on' ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
      aria-pressed={state === 'on'}
      data-testid="sos-sound-toggle"
      title="Play a tone when a new emergency arrives (your browser needs one click to allow audio)"
      onClick={onToggle}
    >
      {label}
    </AlButton>
  );
}

function LiveIndicator({
  isFetching,
  updatedAt,
  error,
}: {
  isFetching: boolean;
  updatedAt: number;
  error: boolean;
}) {
  return (
    <span
      className={`sos-live ${error ? 'sos-live--error' : ''}`}
      data-testid="sos-live-status"
      aria-live="polite"
    >
      <span className="sos-live__dot" aria-hidden />
      {error
        ? 'Live updates paused — retrying'
        : updatedAt
          ? `Live · ${isFetching ? 'updating…' : `updated ${new Date(updatedAt).toLocaleTimeString()}`}`
          : 'Connecting…'}
    </span>
  );
}

export function SosIncidentsPage() {
  const navigate = useNavigate();
  const list = useSosIncidents();
  const now = useNow();
  const [scope, setScope] = useUrlFilterState<SosFilterScope>('scope', 'OPEN', SOS_SCOPE_VALUES);
  const [trigger, setTrigger] = useUrlFilterState<SosTriggerFilter>(
    'trigger',
    'ANY',
    SOS_TRIGGER_VALUES,
  );
  const [search, setSearch] = useState('');
  const cue = useSosNewIncidentCue(list.rows, list.isSuccess);

  const visible = useMemo(
    () => filterSosIncidents(list.rows, { scope, trigger, search }),
    [list.rows, scope, trigger, search],
  );
  const counts = useMemo(() => countSosIncidents(list.rows), [list.rows]);

  const columns = useMemo<ColumnDef<AdminSosSummary>[]>(
    () => [
      {
        id: 'state',
        header: 'State',
        accessorFn: (row) => row.state,
        cell: ({ row }) => (
          <span className="sos-cell-state">
            {cue.highlighted.has(row.original.incidentId) ? (
              <span className="sos-new" data-testid="sos-new-flag">
                New
              </span>
            ) : null}
            <SosStateBadge row={row.original} />
            {row.original.urgent && !isSosTerminal(row.original.state) ? <SosUrgentFlag /> : null}
          </span>
        ),
      },
      {
        id: 'trigger',
        header: 'Trigger',
        accessorFn: (row) => row.trigger,
        cell: ({ row }) => <SosTriggerBadge trigger={row.original.trigger} />,
      },
      {
        id: 'user',
        header: 'User',
        accessorFn: (row) => row.subject.name ?? '',
        cell: ({ row }) => (
          <span className="sos-user-cell">
            <span className="sos-user-cell__name">
              {row.original.subject.name ?? 'Unnamed user'}
            </span>
            <SosPhoneLink phone={row.original.subject.phone} />
          </span>
        ),
      },
      {
        id: 'since',
        header: 'Time since',
        accessorFn: (row) => row.openedAt,
        cell: ({ row }) => (
          <span className="ax-num" title={formatAdminDateTime(row.original.openedAt)}>
            {formatSosElapsed(row.original.openedAt, now)}
          </span>
        ),
      },
      {
        id: 'lastCall',
        header: 'Last call',
        accessorFn: (row) => row.lastCall?.at ?? '',
        cell: ({ row }) => {
          const call = row.original.lastCall;
          return call ? (
            <span>
              #{call.attemptNo} · {sosCallOutcome({ status: call.status, dtmf: null })}
            </span>
          ) : (
            <span className="admin-muted">—</span>
          );
        },
      },
      {
        id: 'help',
        header: 'Help sent',
        accessorFn: (row) => row.familyNotifiedRounds,
        cell: ({ row }) => {
          const r = row.original;
          const parts: string[] = [];
          if (r.familyNotifiedRounds > 0) {
            parts.push(`Family ×${String(r.familyNotifiedRounds)}`);
          }
          if (r.ambulanceReleasedAt) parts.push('Ambulance');
          const reason = sosActivationReason(r.activationReason);
          return (
            <span title={reason ?? undefined}>
              {parts.length > 0 ? parts.join(' · ') : <span className="admin-muted">None yet</span>}
            </span>
          );
        },
      },
      {
        id: 'opened',
        header: 'Opened',
        accessorFn: (row) => row.openedAt,
        cell: ({ row }) => formatAdminDateTime(row.original.openedAt),
      },
    ],
    [cue.highlighted, now],
  );

  const errorView = list.isError ? sosErrorView(list.error) : null;

  return (
    <RequirePermission permission="sos:view">
      <AlStack gap="md">
        <AlPageHeader
          title="SOS console"
          description="Live in-app SOS and crash emergencies. Autolokate calls the user twice; no answer or “need help” activates family + ambulance automatically. When the user says they are safe, you decide. Every view and action is audited."
          actions={
            <div className="sos-header-actions">
              <LiveIndicator
                isFetching={list.isFetching}
                updatedAt={list.dataUpdatedAt}
                error={list.isError && Boolean(list.data)}
              />
              <SoundToggle state={cue.soundState} onToggle={cue.toggleSound} />
            </div>
          }
        />

        {cue.unseen > 0 ? (
          <div className="sos-banner" role="alert" data-testid="sos-new-banner">
            <BellRing size={18} aria-hidden />
            <span>
              {cue.unseen === 1
                ? 'New emergency activity — check the highlighted incident.'
                : `${String(cue.unseen)} new emergency updates — check the highlighted incidents.`}
            </span>
            <AlButton size="sm" variant="secondary" onClick={cue.acknowledge}>
              Acknowledge
            </AlButton>
          </div>
        ) : null}

        {list.notDeployed ? (
          <AdminNotDeployedState title="SOS console" endpoint="GET /admin/v1/sos-incidents" />
        ) : errorView && !list.data ? (
          <div className="sos-stack">
            <AlErrorState
              message={errorView.message}
              onRetry={() => {
                void list.refetch();
              }}
            />
            {errorView.stepUp ? (
              <AlButton variant="primary" onClick={notifyAdminStepUpRequired}>
                Sign in again
              </AlButton>
            ) : null}
          </div>
        ) : (
          <>
            <AdminKpiStrip
              items={[
                { label: 'Open', value: String(counts.open) },
                { label: 'Urgent', value: String(counts.urgent) },
                { label: 'Safe — awaiting admin', value: String(counts.awaitingAdmin) },
                { label: 'Calling user', value: String(counts.calling) },
              ]}
            />
            <AdminDataBlock
              filters={
                <>
                  <AdminFilterField label="Show">
                    <AdminFilterChips
                      options={SCOPE_OPTIONS}
                      value={scope}
                      onChange={setScope}
                      aria-label="Incident scope"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Trigger">
                    <AdminFilterChips
                      options={TRIGGER_OPTIONS}
                      value={trigger}
                      onChange={setTrigger}
                      aria-label="Trigger"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Search">
                    <input
                      className="sos-search"
                      type="search"
                      value={search}
                      placeholder="Name, phone or incident id"
                      aria-label="Search incidents"
                      data-testid="sos-search"
                      onChange={(event) => {
                        setSearch(event.target.value);
                      }}
                    />
                  </AdminFilterField>
                </>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="sos-incidents"
                columns={columns}
                data={visible}
                loading={list.isLoading}
                isRefreshing={false}
                error={errorView && list.data ? errorView.message : null}
                onRetry={() => {
                  void list.refetch();
                }}
                enableGlobalSearch={false}
                emptyTitle={scope === 'OPEN' ? 'No open emergencies' : 'No incidents match'}
                emptyDescription={
                  scope === 'OPEN'
                    ? `All clear. This list checks for new SOS and crash alerts every ${String(SOS_POLL_MS / 1000)} s while this tab is visible.`
                    : 'Try another filter.'
                }
                getRowId={(row) => row.incidentId}
                onRowClick={(row) => {
                  cue.acknowledge();
                  void navigate(adminSosIncidentPath(row.incidentId));
                }}
              />
            </AdminDataBlock>
            {list.capped ? (
              <p className="admin-muted sos-footnote">
                Showing the newest 100 incidents (open ones first).
              </p>
            ) : null}
          </>
        )}
      </AlStack>
    </RequirePermission>
  );
}
