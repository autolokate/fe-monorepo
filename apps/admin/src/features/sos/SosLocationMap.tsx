import type { AdminSosLocation } from '@autolokate/api-client';
import { ExternalLink, Route } from 'lucide-react';

import {
  formatSosElapsed,
  googleMapsEmbedSrc,
  googleMapsPointHref,
  googleMapsTrailHref,
  projectSosTrail,
} from '@/features/sos/sos-model';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

const TRAIL_BOX = { width: 320, height: 180, padding: 18 };

/** Schematic of the live trail (relative positions only; no map tiles). Newest point highlighted. */
function TrailSketch({ trail }: { trail: readonly AdminSosLocation[] }) {
  const points = projectSosTrail(trail, TRAIL_BOX);
  const last = points[points.length - 1];
  const first = points[0];
  if (!last || !first) return null;
  return (
    <svg
      className="sos-trail"
      viewBox={`0 0 ${String(TRAIL_BOX.width)} ${String(TRAIL_BOX.height)}`}
      role="img"
      aria-label={`Location trail with ${String(trail.length)} points; newest highlighted`}
      data-testid="sos-trail"
    >
      {points.length > 1 ? (
        <polyline
          className="sos-trail__line"
          points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        />
      ) : null}
      {points.slice(0, -1).map((p, index) => (
        <circle key={index} className="sos-trail__point" cx={p.x} cy={p.y} r={3} />
      ))}
      {points.length > 1 ? (
        <circle className="sos-trail__start" cx={first.x} cy={first.y} r={4} />
      ) : null}
      <circle className="sos-trail__pulse" cx={last.x} cy={last.y} r={12} />
      <circle className="sos-trail__latest" cx={last.x} cy={last.y} r={6} />
    </svg>
  );
}

/**
 * Live location: a keyless Google Maps embed of the newest point (the iframe only reloads when the
 * point moves), a schematic of the trail, and links out. No map API key is used or exposed.
 */
export function SosLocationMap({
  trail,
  nowMs,
  fromAlertOnly,
}: {
  trail: readonly AdminSosLocation[];
  nowMs: number;
  fromAlertOnly: boolean;
}) {
  const latest = trail[trail.length - 1];
  if (!latest) {
    return (
      <p className="admin-muted" data-testid="sos-location-empty">
        No location received yet. The app sends a fix every 10–15 s while the SOS is open.
      </p>
    );
  }
  const trailHref = googleMapsTrailHref(trail);
  return (
    <div className="sos-map" data-testid="sos-location">
      <div className="sos-map__frame">
        <iframe
          key={`${latest.lat.toFixed(6)},${latest.lng.toFixed(6)}`}
          title="Latest location map"
          src={googleMapsEmbedSrc(latest)}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <div className="sos-map__meta">
        <div>
          <p className="sos-map__coords admin-mono" data-testid="sos-latest-coords">
            {latest.lat.toFixed(6)}, {latest.lng.toFixed(6)}
          </p>
          <p className="admin-muted sos-map__fix">
            {fromAlertOnly ? 'Location when the SOS was raised' : 'Latest live fix'} ·{' '}
            {formatSosElapsed(latest.recordedAt, nowMs)} ago
            {typeof latest.accuracyM === 'number'
              ? ` · ±${String(Math.round(latest.accuracyM))} m`
              : ''}{' '}
            · {formatAdminDateTime(latest.recordedAt)}
          </p>
        </div>
        <div className="sos-map__links">
          <a
            className="admin-link"
            href={googleMapsPointHref(latest)}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="sos-map-link"
          >
            <ExternalLink size={14} aria-hidden /> Open in Google Maps
          </a>
          {trailHref ? (
            <a className="admin-link" href={trailHref} target="_blank" rel="noreferrer noopener">
              <Route size={14} aria-hidden /> Trail route
            </a>
          ) : null}
        </div>
      </div>
      {trail.length > 1 ? <TrailSketch trail={trail} /> : null}
      {trail.length > 1 ? (
        <details className="sos-map__trail">
          <summary>
            Trail — {trail.length} fixes over{' '}
            {formatSosElapsed(trail[0]?.recordedAt ?? '', Date.parse(latest.recordedAt))}
          </summary>
          <ol className="sos-map__points">
            {[...trail]
              .reverse()
              .slice(0, 12)
              .map((point) => (
                <li key={`${point.recordedAt}-${String(point.lat)}`}>
                  <a
                    className="admin-link admin-mono"
                    href={googleMapsPointHref(point)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                  </a>{' '}
                  <span className="admin-muted">{formatAdminDateTime(point.recordedAt)}</span>
                </li>
              ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
