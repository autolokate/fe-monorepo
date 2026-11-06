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
import {
  formatIst,
  formatIstTime,
  formatKm,
  formatMinutes,
  formatScore,
  tripSourceStatus,
  vehicleLabel,
  type VehicleIdentity,
} from '@/features/drivequant/driving-status';
import { googleMapsPointHref } from '@/features/sos/sos-model';
import { useUserTripDetail } from '@/hooks/drivequant/useDriveQuantTelemetry';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

const EVENTS_PAGE = 100;

export function dqSourceLabel(source: string | undefined, verified: boolean): string {
  return tripSourceStatus(source, verified).label;
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
          {event.at ? ` · ${formatIstTime(event.at)}` : ''}
          {event.location ? (
            <>
              {' · '}
              <a
                className="admin-link"
                href={googleMapsPointHref(event.location)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="dq-event-map"
                title="Open this point in maps (new tab)"
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

function placeLine(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(', ') || '—';
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
        No detailed telemetry for this trip — it was reported by the phone, or stored before
        detailed data was kept. The summary above is all that exists.
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
              value={placeLine([
                places.departureAddress,
                places.departureCity,
                places.departureCountry,
              ])}
            />
            <AdminDetailField
              label="To"
              value={placeLine([places.arrivalAddress, places.arrivalCity, places.arrivalCountry])}
            />
          </AdminDetailGrid>
        </AdminDetailSection>
      ) : null}

      <AdminDetailSection
        title={`Events (${String(events.length)})`}
        description="Trip order, times in IST. A location shows only when the server returned one; the full route is never shown to admins."
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

      {view.advice.length > 0 ? (
        <AdminDetailSection
          title="Coaching advice"
          description="Advice shown to the driver for this trip."
        >
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

      {view.groups.length > 0 ? (
        <details className="dq-investigate" data-testid="dq-trip-advanced">
          <summary>
            <strong>Detailed metrics</strong>{' '}
            <span className="admin-muted">
              ({String(view.groups.length)} {view.groups.length === 1 ? 'group' : 'groups'} — for
              investigating a score or event)
            </span>
          </summary>
          <div className="dq-investigate__body">
            {view.groups.map((group) => (
              <AdminDetailSection key={group.id} title={group.title}>
                <div className="dq-group" data-testid={`dq-group-${group.id}`}>
                  {group.sections.map((section) => (
                    <MetricSectionView key={section.key} section={section} />
                  ))}
                </div>
              </AdminDetailSection>
            ))}
            {view.unknown.length > 0 || view.unmappedKeys.length > 0 ? (
              <AdminDetailSection
                title="Other data"
                description="Fields this console has no layout for yet, shown as sent."
              >
                {view.unmappedKeys.length > 0 ? (
                  <p className="admin-muted" data-testid="dq-unmapped-keys">
                    Fields the server received but does not map yet:{' '}
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
          </div>
        </details>
      ) : null}

      <p className="admin-muted dq-footnote">
        {telemetry.source === 'PULL' ? 'Verified (server sync)' : 'Verified'} · processed{' '}
        {formatIst(telemetry.processingDate)} · version {String(telemetry.versionsReceived)} ·
        schema {String(telemetry.schemaVersion)}
        {telemetry.routePoints !== null
          ? ` · ${String(telemetry.routePoints)} route points (route not shown to admins)`
          : ''}
      </p>
    </>
  );
}

/**
 * Trip drawer: summary, events timeline, then detailed metrics behind a disclosure. Opening it is
 * an audited `DRIVER_TRIP_ACCESS` read; the data is dropped from memory when the drawer closes.
 */
export function UserTripDetailSheet({
  userId,
  trip,
  vehicles = [],
  onClose,
}: {
  userId: string;
  trip: AdminUserTripDto | null;
  vehicles?: readonly VehicleIdentity[];
  onClose: () => void;
}) {
  const detail = useUserTripDetail(userId, trip?.tripId ?? null);
  const data = detail.data;
  const context = dqTripContext(data?.telemetry?.metrics);
  const summary = data ?? trip;
  const when = summary?.startedAt ?? (summary?.receivedAt || null);
  // A trip opened from a crash event is a stub (no list row) until the detail read answers.
  const isStub = trip !== null && trip.receivedAt === '';
  const source =
    summary && (!isStub || data)
      ? tripSourceStatus(summary.verified ? trip?.source : 'CLIENT', summary.verified)
      : null;
  const vehicle = vehicleLabel(summary?.vehicleId, vehicles);
  return (
    <AlSheet
      open={trip !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={when ? `Trip · ${formatIst(when)}` : 'Trip'}
      description="Trip summary, events and detailed metrics. Viewing is audited (DRIVER_TRIP_ACCESS)."
    >
      <div className="dq-drawer" data-testid="dq-trip-drawer">
        {summary ? (
          <AdminDetailSection title="Summary">
            <AdminDetailGrid>
              <AdminDetailField label="Started" value={formatIst(summary.startedAt)} />
              <AdminDetailField label="Ended" value={formatIst(summary.endedAt)} />
              <AdminDetailField label="Distance" value={formatKm(summary.distanceKm)} />
              <AdminDetailField
                label="Duration (driving)"
                value={`${formatMinutes(summary.durationMinutes)} (${formatMinutes(summary.drivingDurationMinutes)})`}
              />
              <AdminDetailField
                label="Safety / eco"
                value={`${formatScore(summary.scores.safety)} / ${formatScore(summary.scores.eco)}`}
              />
              <AdminDetailField
                label="Distraction / speeding"
                value={`${formatScore(summary.scores.distraction)} / ${formatScore(summary.scores.speeding)}`}
              />
              <AdminDetailField
                label="Source"
                value={source ? <DqChip label={source.label} tone={source.tone} /> : '—'}
              />
              <AdminDetailField
                label="Vehicle"
                value={
                  vehicle.secondary ? `${vehicle.primary} · ${vehicle.secondary}` : vehicle.primary
                }
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
