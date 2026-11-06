import type {
  AdminDqTripEvent,
  AdminUserTripDetailDto,
  AdminUserTripDto,
} from '@autolokate/api-client';
import { AlButton, AlSheet } from '@autolokate/ui';
import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  buildDqMetricsView,
  countDqEventsByKind,
  dqEventDetail,
  dqEventLabel,
  dqEventSeverity,
  dqTripContext,
  formatDqNumber,
  formatDqOffset,
  sortDqEvents,
  type DqMetricSection,
} from '@/features/drivequant/drivequant-model';
import { DqChip, DqErrorBlock, DqRawBlock } from '@/features/drivequant/dq-ui';
import { googleMapsPointHref } from '@/features/sos/sos-model';
import { useUserTripDetail } from '@/hooks/drivequant/useDriveQuantTelemetry';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

const EVENTS_PAGE = 100;

function score(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? formatDqNumber(value, 1) : '—';
}

function minutes(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${String(Math.round(value))} min`
    : '—';
}

export function dqSourceLabel(source: string | undefined, verified: boolean): string {
  if (source === 'CLIENT' || (!source && !verified)) return 'Phone-reported (unverified)';
  if (source === 'PULL') return 'DriveQuant verified (pull)';
  return 'DriveQuant verified (push)';
}

function MetricSectionView({ section }: { section: DqMetricSection }) {
  return (
    <div className="dq-section" data-testid={`dq-metric-${section.key}`}>
      <h4 className="dq-section__title">{section.title}</h4>
      {section.rows.length > 0 ? (
        <AdminDetailGrid>
          {section.rows.map((row) => (
            <AdminDetailField key={row.key} label={row.label} value={row.value} />
          ))}
        </AdminDetailGrid>
      ) : null}
      {section.tables.map((table) => (
        <div key={table.key} className="dq-table-wrap">
          {table.title !== section.title ? <p className="dq-table__title">{table.title}</p> : null}
          <table className="dq-table">
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={index}>
                  {table.columns.map((column) => (
                    <td key={column.key} className="ax-num">
                      {row[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function EventItem({ event }: { event: AdminDqTripEvent }) {
  const severity = dqEventSeverity(event);
  const detail = dqEventDetail(event);
  return (
    <li className={`dq-timeline__item dq-timeline__item--${event.kind.toLowerCase()}`}>
      <span className="dq-timeline__dot" aria-hidden />
      <div className="dq-timeline__body">
        <p className="dq-timeline__title">
          <strong>{dqEventLabel(event)}</strong>{' '}
          <span className="sos-chip-muted">{humanizeAdminLabel(event.kind)}</span>
          {severity ? <DqChip label={severity.label} tone={severity.tone} /> : null}
        </p>
        {detail ? <p className="dq-timeline__detail">{detail}</p> : null}
        <p className="admin-muted dq-timeline__meta ax-num">
          {event.offsetS !== null ? formatDqOffset(event.offsetS) : ''}
          {event.at ? ` · ${formatAdminDateTime(event.at)}` : ''}
          {event.location ? (
            <>
              {' · '}
              <a
                className="admin-link"
                href={googleMapsPointHref(event.location)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="dq-event-map"
              >
                {event.location.lat.toFixed(5)}, {event.location.lng.toFixed(5)}{' '}
                <ExternalLink size={12} aria-hidden />
              </a>
            </>
          ) : null}
        </p>
      </div>
    </li>
  );
}

function TripTelemetry({ trip }: { trip: AdminUserTripDetailDto }) {
  const telemetry = trip.telemetry;
  const view = useMemo(() => buildDqMetricsView(telemetry?.metrics), [telemetry]);
  const events = useMemo(() => sortDqEvents(telemetry?.events ?? []), [telemetry]);
  const counts = useMemo(() => countDqEventsByKind(events), [events]);
  const [kind, setKind] = useState<string>('ALL');
  const [shown, setShown] = useState(EVENTS_PAGE);
  if (!telemetry) {
    return (
      <p className="admin-empty-note" data-testid="dq-trip-no-telemetry">
        No DriveQuant telemetry for this trip — it was reported by the phone, or stored before the
        full data was kept.
      </p>
    );
  }
  const filtered = kind === 'ALL' ? events : events.filter((event) => event.kind === kind);
  const places = telemetry.places;
  return (
    <>
      {places ? (
        <AdminDetailSection title="Places" description="Decrypted for this audited support read.">
          <AdminDetailGrid>
            <AdminDetailField
              label="From"
              value={
                [places.departureAddress, places.departureCity, places.departureCountry]
                  .filter(Boolean)
                  .join(', ') || '—'
              }
            />
            <AdminDetailField
              label="To"
              value={
                [places.arrivalAddress, places.arrivalCity, places.arrivalCountry]
                  .filter(Boolean)
                  .join(', ') || '—'
              }
            />
          </AdminDetailGrid>
        </AdminDetailSection>
      ) : null}

      {view.groups.map((group) => (
        <AdminDetailSection key={group.id} title={group.title}>
          <div className="dq-group" data-testid={`dq-group-${group.id}`}>
            {group.sections.map((section) => (
              <MetricSectionView key={section.key} section={section} />
            ))}
          </div>
        </AdminDetailSection>
      ))}

      {view.advice.length > 0 ? (
        <AdminDetailSection title="Coaching advice" description="DriveQuant advice ids and themes.">
          <ul className="dq-advice" data-testid="dq-advice">
            {view.advice.map((advice, index) => (
              <li key={advice.id ?? index}>
                <strong>{advice.title ?? 'Advice'}</strong>
                <span className="admin-muted admin-mono">
                  {' '}
                  {[
                    advice.messageId,
                    advice.theme !== null ? `theme ${String(advice.theme)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </AdminDetailSection>
      ) : null}

      <AdminDetailSection
        title={`Events (${String(events.length)})`}
        description="Trip order. A location shows only when the server returned one; the full route is never shown to admins."
      >
        {events.length === 0 ? (
          <p className="admin-muted">No events on this trip.</p>
        ) : (
          <>
            <div className="dq-filter" role="group" aria-label="Event kind">
              {['ALL', ...Object.keys(counts)].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`dq-filter__chip${kind === option ? ' dq-filter__chip--on' : ''}`}
                  aria-pressed={kind === option}
                  data-testid={`dq-event-filter-${option}`}
                  onClick={() => {
                    setKind(option);
                    setShown(EVENTS_PAGE);
                  }}
                >
                  {option === 'ALL' ? 'All' : humanizeAdminLabel(option)}{' '}
                  <span className="ax-num">
                    {String(option === 'ALL' ? events.length : (counts[option] ?? 0))}
                  </span>
                </button>
              ))}
            </div>
            <ol className="dq-timeline" data-testid="dq-events">
              {filtered.slice(0, shown).map((event) => (
                <EventItem key={`${event.kind}-${String(event.seq)}`} event={event} />
              ))}
            </ol>
            {filtered.length > shown ? (
              <AlButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShown((n) => n + EVENTS_PAGE);
                }}
              >
                Show more events ({String(filtered.length - shown)} left)
              </AlButton>
            ) : null}
          </>
        )}
      </AdminDetailSection>

      {view.unknown.length > 0 || view.unmappedKeys.length > 0 ? (
        <AdminDetailSection
          title="Other data"
          description="Fields this console has no layout for yet, shown as sent."
        >
          {view.unmappedKeys.length > 0 ? (
            <p className="admin-muted" data-testid="dq-unmapped-keys">
              DriveQuant sent keys the server does not map yet:{' '}
              <span className="admin-mono">{view.unmappedKeys.join(', ')}</span>
            </p>
          ) : null}
          {view.unknown.map((entry) => (
            <DqRawBlock
              key={entry.key}
              title={humanizeAdminLabel(entry.key)}
              value={entry.value}
              testId={`dq-raw-${entry.key}`}
            />
          ))}
        </AdminDetailSection>
      ) : null}

      <p className="admin-muted dq-footnote">
        {telemetry.source === 'PULL' ? 'Pulled from DriveQuant' : 'DriveQuant push'} · processed{' '}
        {formatAdminDateTime(telemetry.processingDate)} · version{' '}
        {String(telemetry.versionsReceived)} · schema {String(telemetry.schemaVersion)}
        {telemetry.routePoints !== null
          ? ` · ${String(telemetry.routePoints)} route points (route not shown to admins)`
          : ''}
      </p>
    </>
  );
}

/**
 * Trip drawer: summary, every DriveQuant metric grouped, the events timeline. Opening it is an
 * audited `DRIVER_TRIP_ACCESS` read; the data is dropped from memory when the drawer closes.
 */
export function UserTripDetailSheet({
  userId,
  trip,
  onClose,
}: {
  userId: string;
  trip: AdminUserTripDto | null;
  onClose: () => void;
}) {
  const detail = useUserTripDetail(userId, trip?.tripId ?? null);
  const data = detail.data;
  const context = dqTripContext(data?.telemetry?.metrics);
  const summary = data ?? trip;
  const when = summary?.startedAt ?? (summary?.receivedAt || null);
  return (
    <AlSheet
      open={trip !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={when ? `Trip · ${formatAdminDateTime(when)}` : 'Trip'}
      description="Every DriveQuant metric and event. Viewing is audited (DRIVER_TRIP_ACCESS)."
    >
      <div className="dq-drawer" data-testid="dq-trip-drawer">
        {summary ? (
          <AdminDetailSection title="Summary">
            <AdminDetailGrid>
              <AdminDetailField label="Started" value={formatAdminDateTime(summary.startedAt)} />
              <AdminDetailField label="Ended" value={formatAdminDateTime(summary.endedAt)} />
              <AdminDetailField
                label="Distance"
                value={
                  summary.distanceKm === null ? '—' : `${formatDqNumber(summary.distanceKm, 1)} km`
                }
              />
              <AdminDetailField
                label="Duration (driving)"
                value={`${minutes(summary.durationMinutes)} (${minutes(summary.drivingDurationMinutes)})`}
              />
              <AdminDetailField
                label="Safety / eco"
                value={`${score(summary.scores.safety)} / ${score(summary.scores.eco)}`}
              />
              <AdminDetailField
                label="Distraction / speeding"
                value={`${score(summary.scores.distraction)} / ${score(summary.scores.speeding)}`}
              />
              <AdminDetailField
                label="Source"
                value={dqSourceLabel(trip?.source, summary.verified)}
              />
              <AdminDetailField label="Transport" value={context.transport ?? '—'} />
              <AdminDetailField
                label="Occupant"
                value={
                  context.occupant
                    ? `${context.occupant}${context.passengerProbability !== null ? ` (passenger ${formatDqNumber(context.passengerProbability, 0)}%)` : ''}`
                    : '—'
                }
              />
              <AdminDetailField label="Vehicle" value={shortAdminId(summary.vehicleId)} mono />
              <AdminDetailField label="Trip id" value={summary.tripId} mono />
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}
        {detail.isLoading ? <AdminPageLoader label="Loading trip telemetry…" /> : null}
        {detail.error ? <DqErrorBlock error={detail.error} onRetry={detail.refetch} /> : null}
        {data ? <TripTelemetry trip={data} /> : null}
      </div>
    </AlSheet>
  );
}
