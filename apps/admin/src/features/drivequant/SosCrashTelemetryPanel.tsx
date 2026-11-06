import type {
  AdminDqCrashTelemetryDto,
  AdminSosCrash,
  AdminSosVehicle,
} from '@autolokate/api-client';
import { AlButton } from '@autolokate/ui';
import { ExternalLink, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { DqSeriesChart, DqTrackSketch } from '@/features/drivequant/DqCharts';
import {
  buildDqMetricSection,
  dqGpsCharts,
  dqGpsTrack,
  dqImuCharts,
  dqRiskTone,
  formatDqNumber,
} from '@/features/drivequant/drivequant-model';
import { DqChip, DqErrorBlock, DqRawBlock } from '@/features/drivequant/dq-ui';
import {
  crashConsentStatus,
  crashEntitlementStatus,
  crashOutcomeStatus,
  crashStateStatus,
  formatIst,
  formatKmh,
  formatProbability,
  vehicleAttributionStatus,
} from '@/features/drivequant/driving-status';
import { googleMapsPointHref } from '@/features/sos/sos-model';
import { useSosCrashTelemetry } from '@/hooks/drivequant/useDriveQuantTelemetry';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import {
  AdminPanel,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

const REPORT_SECTIONS = [
  'tripConditions',
  'driverFatigue',
  'aggressiveDriving',
  'phoneUsage',
  'speeding',
] as const;

function CrashReport({ report }: { report: Record<string, unknown> }) {
  const risk =
    report.riskFactors && typeof report.riskFactors === 'object'
      ? (report.riskFactors as Record<string, unknown>)
      : null;
  const known = new Set<string>([...REPORT_SECTIONS, 'riskFactors']);
  const extra = Object.entries(report).filter(([key]) => !known.has(key));
  return (
    <div className="dq-section" data-testid="dq-crash-report">
      <h4 className="dq-section__title">Crash report</h4>
      {risk ? (
        <div className="dq-risk" aria-label="Risk factors">
          {Object.entries(risk).map(([factor, level]) => (
            <DqChip
              key={factor}
              label={`${humanizeAdminLabel(factor)}: ${typeof level === 'string' ? humanizeAdminLabel(level) : '—'}`}
              tone={dqRiskTone(level)}
            />
          ))}
        </div>
      ) : null}
      {REPORT_SECTIONS.filter((key) => report[key] && typeof report[key] === 'object').map(
        (key) => {
          const section = buildDqMetricSection(key, report[key]);
          return (
            <div key={key} className="dq-report-block">
              <p className="dq-table__title">{section.title}</p>
              <AdminDetailGrid>
                {section.rows.map((row) => (
                  <AdminDetailField key={row.key} label={row.label} value={row.value} />
                ))}
              </AdminDetailGrid>
            </div>
          );
        },
      )}
      {extra.map(([key, value]) => (
        <DqRawBlock key={key} title={humanizeAdminLabel(key)} value={value} />
      ))}
    </div>
  );
}

/** GPS / IMU windows, crash report, raw features — only when an operator opens the investigation. */
function CrashInvestigation({ crash }: { crash: AdminDqCrashTelemetryDto }) {
  const gpsCharts = useMemo(() => dqGpsCharts(crash.gps, crash.features), [crash]);
  const imuCharts = useMemo(() => dqImuCharts(crash.imu, crash.features), [crash]);
  const track = useMemo(() => dqGpsTrack(crash.gps), [crash]);
  const features = crash.features ?? {};
  return (
    <div className="dq-investigate__body" data-testid="dq-crash-investigation">
      <AdminDetailGrid>
        <AdminDetailField
          label="Speed drop (near impact)"
          value={formatKmh(crash.velocityOffsetNearKmh)}
        />
        <AdminDetailField
          label="Crash type / speed class"
          value={`${crash.crashType === null ? '—' : String(crash.crashType)} / ${crash.velocityClass === null ? '—' : String(crash.velocityClass)}`}
        />
        <AdminDetailField label="Trip started" value={formatIst(crash.tripStartedAt)} />
        <AdminDetailField label="Detection model" value={crash.predictionVersion ?? '—'} mono />
      </AdminDetailGrid>

      {track.length > 1 || gpsCharts.length > 0 ? (
        <div className="dq-section">
          <h4 className="dq-section__title">
            GPS window{' '}
            <span className="admin-muted">
              {crash.gpsSamples !== null ? `${String(crash.gpsSamples)} samples` : ''}
              {crash.gpsAccuracyM.min !== null && crash.gpsAccuracyM.max !== null
                ? ` · accuracy ${formatDqNumber(crash.gpsAccuracyM.min, 0)}–${formatDqNumber(crash.gpsAccuracyM.max, 0)} m`
                : ''}
            </span>
          </h4>
          <div className="dq-chart-grid">
            {track.length > 1 ? (
              <figure className="dq-chart">
                <figcaption className="dq-chart__head">
                  <span className="dq-chart__title">
                    Recorded GPS points{' '}
                    <span className="admin-muted">(relative positions, no map)</span>
                  </span>
                </figcaption>
                <DqTrackSketch track={track} crash={crash.location} />
              </figure>
            ) : null}
            {gpsCharts.map((chart) => (
              <DqSeriesChart key={chart.key} chart={chart} />
            ))}
          </div>
        </div>
      ) : (
        <p className="admin-muted" data-testid="dq-crash-no-gps">
          No GPS window was stored for this crash.
        </p>
      )}

      {imuCharts.length > 0 ? (
        <div className="dq-section">
          <h4 className="dq-section__title">
            Motion sensors{' '}
            <span className="admin-muted">
              {crash.imuSamples !== null ? `${String(crash.imuSamples)} samples` : ''}
            </span>
          </h4>
          <div className="dq-chart-grid" data-testid="dq-imu-charts">
            {imuCharts.map((chart) => (
              <DqSeriesChart key={chart.key} chart={chart} />
            ))}
          </div>
          {!imuCharts.some((chart) => chart.label.startsWith('Gyroscope')) ? (
            <p className="admin-muted dq-footnote">
              No gyroscope series was recorded for this crash.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="admin-muted" data-testid="dq-crash-no-imu">
          No motion-sensor window was stored for this crash.
        </p>
      )}

      {crash.report ? <CrashReport report={crash.report} /> : null}

      {Object.keys(features).length > 0 ? (
        <DqRawBlock title="Detection features (raw)" value={features} testId="dq-crash-features" />
      ) : null}
      <p className="admin-muted dq-footnote">
        Received {formatIst(crash.receivedAt)} · {String(crash.versionsReceived)}{' '}
        {crash.versionsReceived === 1 ? 'delivery' : 'deliveries'} · crash id{' '}
        <span className="admin-mono">{crash.crashId}</span>
      </p>
    </div>
  );
}

function vehicleText(vehicleId: string | null, vehicles: readonly AdminSosVehicle[]): string {
  if (!vehicleId) return 'No vehicle';
  const vehicle = vehicles.find((row) => row.vehicleId === vehicleId);
  if (!vehicle) return shortAdminId(vehicleId);
  const model = [vehicle.color, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return [vehicle.plate ?? shortAdminId(vehicleId), model].filter(Boolean).join(' · ');
}

function CrashTelemetryItem({
  crash,
  accountId,
  subjectName,
  vehicles,
}: {
  crash: AdminDqCrashTelemetryDto;
  accountId: string;
  subjectName: string | null;
  vehicles: readonly AdminSosVehicle[];
}) {
  const [investigating, setInvestigating] = useState(false);
  const state = crashStateStatus(crash.state);
  const outcome = crashOutcomeStatus(crash.outcome, crash.state);
  const plan = crashEntitlementStatus(crash);
  const consent = crashConsentStatus(crash);
  const attribution = vehicleAttributionStatus(crash.vehicleAttribution);
  const canViewUsers = useAdminPermission('users:read');
  return (
    <li className="dq-crash dq-crash-summary" data-testid="dq-crash-telemetry-item">
      <div className="dq-crash-summary__head">
        <span title={state.hint}>
          <DqChip label={state.label} tone={state.tone} />
        </span>
        <span title={outcome.hint}>
          <DqChip label={outcome.label} tone={outcome.tone} />
        </span>
        <span title={plan.hint}>
          <DqChip label={plan.label} tone={plan.tone} />
        </span>
        <span title={consent.hint}>
          <DqChip label={consent.label} tone={consent.tone} />
        </span>
        <span className="dq-crash-summary__prob ax-num">
          {formatProbability(crash.probability)} <span className="admin-muted">probability</span>
        </span>
      </div>

      {crash.state === 'FAILED_TO_PREDICT' ? (
        <p className="dq-callout" role="note" data-testid="dq-crash-needs-review">
          The detector could not classify this event, so it was <strong>not escalated</strong>.
          Review the sensor data and contact the user if needed.
        </p>
      ) : null}
      {attribution.guess ? (
        <p className="dq-callout" role="note" data-testid="dq-crash-vehicle-guess">
          The vehicle is a best guess ({attribution.label.toLowerCase()}). Confirm it with the user.
        </p>
      ) : null}

      <AdminDetailGrid>
        <AdminDetailField label="Crash time (IST)" value={formatIst(crash.crashAt)} />
        <AdminDetailField label="Impact speed" value={formatKmh(crash.velocityKmh)} />
        <AdminDetailField label="User" value={subjectName ?? shortAdminId(accountId)} />
        <AdminDetailField
          label="Vehicle"
          value={
            <span className="dq-status-stack">
              <span>{vehicleText(crash.vehicleId, vehicles)}</span>
              {crash.vehicleId ? (
                <span className="admin-muted dq-footnote">{attribution.label}</span>
              ) : null}
            </span>
          }
        />
      </AdminDetailGrid>

      <div className="dq-location" data-testid="dq-crash-location">
        <MapPin size={16} aria-hidden />
        {crash.location ? (
          <>
            <span className="dq-location__coords" data-testid="dq-crash-coords">
              {crash.location.lat.toFixed(6)}, {crash.location.lng.toFixed(6)}
            </span>
            <a
              className="admin-link"
              href={googleMapsPointHref(crash.location)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="dq-crash-map"
            >
              Open in maps <ExternalLink size={12} aria-hidden />
            </a>
          </>
        ) : (
          <span className="admin-muted" data-testid="dq-crash-no-location">
            No crash location was recorded. Use the live location of the incident if available.
          </span>
        )}
        {crash.userLocationUrl?.startsWith('https://') ? (
          <a
            className="admin-link"
            href={crash.userLocationUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="dq-crash-live-url"
          >
            Shared live location <ExternalLink size={12} aria-hidden />
          </a>
        ) : null}
      </div>

      <div className="dq-links">
        {crash.dqTripId ? (
          <span className="admin-muted">
            Linked trip <span className="admin-mono">{shortAdminId(crash.dqTripId, 12)}</span>
            {canViewUsers ? (
              <>
                {' '}
                — open it from the user&apos;s{' '}
                <Link
                  className="admin-link"
                  to={`${adminPaths.users}?account=${encodeURIComponent(accountId)}&tab=driving`}
                  data-testid="dq-crash-user-driving"
                >
                  Driving tab
                </Link>
              </>
            ) : null}
          </span>
        ) : (
          <span className="admin-muted">No linked trip.</span>
        )}
      </div>

      <div className="dq-investigate">
        <AlButton
          size="sm"
          variant="secondary"
          aria-expanded={investigating}
          data-testid="dq-crash-investigate"
          onClick={() => {
            setInvestigating((open) => !open);
          }}
        >
          {investigating ? 'Hide sensor data' : 'Investigate sensor data'}
        </AlButton>
        {investigating ? <CrashInvestigation crash={crash} /> : null}
      </div>
    </li>
  );
}

/**
 * Crash events of a CRASH incident: an overview of each (status, escalation, plan / consent, user,
 * vehicle, location as coordinates with an optional maps link) with the sensor windows and crash
 * report behind "Investigate". Read once when the incident opens (audited `INCIDENT_PII_ACCESS`,
 * never cached); the summary from the incident detail shows while it loads or when it is unavailable.
 */
export function SosCrashTelemetryPanel({
  incidentId,
  accountId,
  subjectName = null,
  vehicles = [],
  summary,
}: {
  incidentId: string;
  accountId: string;
  subjectName?: string | null;
  vehicles?: readonly AdminSosVehicle[];
  summary: readonly AdminSosCrash[];
}) {
  const telemetry = useSosCrashTelemetry(incidentId, true);
  const items = telemetry.data ?? [];
  return (
    <AdminPanel
      title="Crash events"
      subtitle="Detected crash, escalation and sensor data. Viewing is audited (INCIDENT_PII_ACCESS). Times in IST."
    >
      <div data-testid="sos-crash-telemetry">
        {telemetry.isLoading ? <AdminPageLoader label="Loading crash data…" /> : null}
        {telemetry.error ? (
          <DqErrorBlock error={telemetry.error} onRetry={telemetry.refetch} />
        ) : null}
        {telemetry.notDeployed ? (
          <p className="admin-muted" data-testid="sos-crash-telemetry-unavailable">
            Detailed crash data is not available on this server yet. The summary below comes from
            the incident.
          </p>
        ) : null}
        {telemetry.data && items.length === 0 ? (
          <p className="admin-muted" data-testid="sos-crash-telemetry-empty">
            No crash sensor data is stored for this incident.
          </p>
        ) : null}
        {items.length > 0 ? (
          <ul className="sos-list">
            {items.map((crash) => (
              <CrashTelemetryItem
                key={crash.crashId}
                crash={crash}
                accountId={accountId}
                subjectName={subjectName}
                vehicles={vehicles}
              />
            ))}
          </ul>
        ) : !telemetry.isLoading && summary.length > 0 ? (
          <ul className="sos-list" data-testid="sos-crash">
            {summary.map((crash) => {
              const state = crashStateStatus(crash.state);
              const outcome = crashOutcomeStatus(crash.outcome, crash.state);
              return (
                <li key={crash.crashId} className="sos-list__item">
                  <div className="sos-list__head">
                    <DqChip label={state.label} tone={state.tone} />
                    <span className="sos-chip-muted">{outcome.label}</span>
                  </div>
                  <p className="sos-list__body">
                    Crash probability {formatProbability(crash.probability)}
                    {crash.crashAt ? ` · ${formatIst(crash.crashAt)}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </AdminPanel>
  );
}
