import type { AdminDqCrashTelemetryDto, AdminSosCrash } from '@autolokate/api-client';
import { ExternalLink, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { DqSeriesChart, DqTrackSketch } from '@/features/drivequant/DqCharts';
import {
  buildDqMetricSection,
  dqCrashStateMeta,
  dqGpsCharts,
  dqGpsTrack,
  dqImuCharts,
  dqRiskTone,
  formatDqNumber,
  formatDqProbability,
} from '@/features/drivequant/drivequant-model';
import { DqChip, DqErrorBlock, DqRawBlock } from '@/features/drivequant/dq-ui';
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
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

const REPORT_SECTIONS = [
  'tripConditions',
  'driverFatigue',
  'aggressiveDriving',
  'phoneUsage',
  'speeding',
] as const;

function kmh(value: number | null): string {
  return value === null ? '—' : `${formatDqNumber(value, 1)} km/h`;
}

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

function CrashTelemetryItem({
  crash,
  accountId,
}: {
  crash: AdminDqCrashTelemetryDto;
  accountId: string;
}) {
  const meta = dqCrashStateMeta(crash.state);
  const gpsCharts = useMemo(() => dqGpsCharts(crash.gps, crash.features), [crash]);
  const imuCharts = useMemo(() => dqImuCharts(crash.imu, crash.features), [crash]);
  const track = useMemo(() => dqGpsTrack(crash.gps), [crash]);
  const canViewUsers = useAdminPermission('users:read');
  const features = crash.features ?? {};
  return (
    <li className="dq-crash" data-testid="dq-crash-telemetry-item">
      <div className="sos-list__head">
        <DqChip label={meta.label} tone={meta.tone} />
        <span className="sos-chip-muted">{humanizeAdminLabel(crash.outcome)}</span>
        <strong className="ax-num">{formatDqProbability(crash.probability)}</strong>
        <span className="admin-muted">probability</span>
      </div>
      <AdminDetailGrid>
        <AdminDetailField label="Crash time" value={formatAdminDateTime(crash.crashAt)} />
        <AdminDetailField label="Impact speed" value={kmh(crash.velocityKmh)} />
        <AdminDetailField label="Speed drop (near)" value={kmh(crash.velocityOffsetNearKmh)} />
        <AdminDetailField
          label="Crash type / speed class"
          value={`${crash.crashType === null ? '—' : String(crash.crashType)} / ${crash.velocityClass === null ? '—' : String(crash.velocityClass)}`}
        />
        <AdminDetailField label="Trip started" value={formatAdminDateTime(crash.tripStartedAt)} />
        <AdminDetailField
          label="Vehicle"
          value={`${shortAdminId(crash.vehicleId)}${crash.vehicleAttribution ? ` · ${humanizeAdminLabel(crash.vehicleAttribution)}` : ''}`}
        />
        <AdminDetailField label="Model" value={crash.predictionVersion ?? '—'} mono />
        <AdminDetailField label="Crash id" value={crash.crashId} mono />
      </AdminDetailGrid>

      <div className="dq-links dq-crash__links">
        {crash.location ? (
          <a
            className="admin-link"
            href={googleMapsPointHref(crash.location)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="dq-crash-map"
          >
            <MapPin size={14} aria-hidden /> {crash.location.lat.toFixed(6)},{' '}
            {crash.location.lng.toFixed(6)} <ExternalLink size={12} aria-hidden />
          </a>
        ) : (
          <span className="admin-muted" data-testid="dq-crash-no-location">
            No crash location stored.
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
            DriveQuant live location <ExternalLink size={12} aria-hidden />
          </a>
        ) : null}
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
        ) : null}
      </div>

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
                  <span className="dq-chart__title">Track</span>
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
          No GPS window stored for this crash.
        </p>
      )}

      {imuCharts.length > 0 ? (
        <div className="dq-section">
          <h4 className="dq-section__title">
            Motion sensors (IMU){' '}
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
              DriveQuant sends no gyroscope series for this crash.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="admin-muted" data-testid="dq-crash-no-imu">
          No motion-sensor window stored for this crash.
        </p>
      )}

      {crash.report ? <CrashReport report={crash.report} /> : null}

      {Object.keys(features).length > 0 ? (
        <DqRawBlock
          title="Crash features (DriveQuant)"
          value={features}
          testId="dq-crash-features"
        />
      ) : null}
      <p className="admin-muted dq-footnote">
        Received {formatAdminDateTime(crash.receivedAt)} · {String(crash.versionsReceived)}{' '}
        {crash.versionsReceived === 1 ? 'delivery' : 'deliveries'}
      </p>
    </li>
  );
}

/**
 * DriveQuant crash telemetry for a CRASH incident: decrypted location, GPS + IMU windows, crash
 * report. Read once when the incident opens (audited `INCIDENT_PII_ACCESS`, never cached); the
 * summary from the incident detail shows while it loads or when it is unavailable.
 */
export function SosCrashTelemetryPanel({
  incidentId,
  accountId,
  summary,
}: {
  incidentId: string;
  accountId: string;
  summary: readonly AdminSosCrash[];
}) {
  const telemetry = useSosCrashTelemetry(incidentId, true);
  const items = telemetry.data ?? [];
  return (
    <AdminPanel
      title="Crash telemetry"
      subtitle="DriveQuant crash detection. Viewing is audited (INCIDENT_PII_ACCESS)."
    >
      <div data-testid="sos-crash-telemetry">
        {telemetry.isLoading ? <AdminPageLoader label="Loading crash telemetry…" /> : null}
        {telemetry.error ? (
          <DqErrorBlock error={telemetry.error} onRetry={telemetry.refetch} />
        ) : null}
        {telemetry.notDeployed ? (
          <p className="admin-muted" data-testid="sos-crash-telemetry-unavailable">
            Crash telemetry is not available on this server yet.
          </p>
        ) : null}
        {telemetry.data && items.length === 0 ? (
          <p className="admin-muted" data-testid="sos-crash-telemetry-empty">
            No DriveQuant telemetry is stored for this incident.
          </p>
        ) : null}
        {items.length > 0 ? (
          <ul className="sos-list">
            {items.map((crash) => (
              <CrashTelemetryItem key={crash.crashId} crash={crash} accountId={accountId} />
            ))}
          </ul>
        ) : !telemetry.isLoading && summary.length > 0 ? (
          <ul className="sos-list" data-testid="sos-crash">
            {summary.map((crash) => (
              <li key={crash.crashId} className="sos-list__item">
                <div className="sos-list__head">
                  <strong>{humanizeAdminLabel(crash.state)}</strong>
                  <span className="sos-chip-muted">{humanizeAdminLabel(crash.outcome)}</span>
                </div>
                <p className="sos-list__body">
                  Crash probability {formatDqProbability(crash.probability)}
                  {crash.crashAt ? ` · ${formatAdminDateTime(crash.crashAt)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AdminPanel>
  );
}
