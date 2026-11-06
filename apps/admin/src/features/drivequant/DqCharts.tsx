import { useId, useMemo, useState, type PointerEvent } from 'react';

import {
  formatDqNumber,
  projectDqSeries,
  type DqCrashChart,
} from '@/features/drivequant/drivequant-model';
import { projectSosTrail } from '@/features/sos/sos-model';

const BOX = { width: 320, height: 96, padX: 6, padY: 10 };

function withUnit(value: number, unit: string): string {
  const text = formatDqNumber(value, 1);
  return unit ? (unit === '°' ? `${text}°` : `${text} ${unit}`) : text;
}

/**
 * One series as a small line chart (inline SVG, single hue → no legend; the title names it). The
 * impact time is a dashed rule. Hovering / touching shows the nearest sample.
 */
export function DqSeriesChart({ chart }: { chart: DqCrashChart }) {
  const titleId = useId();
  const geo = useMemo(() => projectDqSeries(chart.points, BOX), [chart.points]);
  const [hover, setHover] = useState<number | null>(null);
  const point = hover !== null ? chart.points[hover] : undefined;

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * BOX.width;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    chart.points.forEach((p, i) => {
      const d = Math.abs(geo.x(p.t) - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  };

  const impactX =
    chart.impactT !== null && chart.impactT >= geo.tMin && chart.impactT <= geo.tMax
      ? geo.x(chart.impactT)
      : null;

  return (
    <figure className="dq-chart" data-testid={`dq-chart-${chart.key}`}>
      <figcaption className="dq-chart__head" id={titleId}>
        <span className="dq-chart__title">
          {chart.label}
          {chart.unit ? <span className="admin-muted"> ({chart.unit})</span> : null}
        </span>
        <span className="dq-chart__readout ax-num" aria-live="polite">
          {point
            ? `${withUnit(point.v, chart.unit)} at ${formatDqNumber(point.t, 2)} s`
            : `${withUnit(geo.min, chart.unit)} – ${withUnit(geo.max, chart.unit)}`}
        </span>
      </figcaption>
      <svg
        className="dq-chart__svg"
        viewBox={`0 0 ${String(BOX.width)} ${String(BOX.height)}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-desc`}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setHover(null);
        }}
      >
        <desc id={`${titleId}-desc`}>
          {`${String(chart.points.length)} samples from ${formatDqNumber(geo.tMin, 1)} s to ${formatDqNumber(geo.tMax, 1)} s; min ${withUnit(geo.min, chart.unit)}, max ${withUnit(geo.max, chart.unit)}.`}
        </desc>
        <line
          className="dq-chart__baseline"
          x1={BOX.padX}
          x2={BOX.width - BOX.padX}
          y1={BOX.height - BOX.padY}
          y2={BOX.height - BOX.padY}
        />
        {impactX !== null ? (
          <line
            className="dq-chart__impact"
            x1={impactX}
            x2={impactX}
            y1={2}
            y2={BOX.height - 2}
            data-testid="dq-chart-impact"
          />
        ) : null}
        <path className="dq-chart__line" d={geo.path} />
        {point ? (
          <>
            <line
              className="dq-chart__cross"
              x1={geo.x(point.t)}
              x2={geo.x(point.t)}
              y1={2}
              y2={BOX.height - 2}
            />
            <circle className="dq-chart__dot" cx={geo.x(point.t)} cy={geo.y(point.v)} r={4} />
          </>
        ) : null}
      </svg>
      <div className="dq-chart__axis admin-muted ax-num">
        <span>{formatDqNumber(geo.tMin, 1)} s</span>
        {impactX !== null ? <span className="dq-chart__impact-label">impact</span> : null}
        <span>{formatDqNumber(geo.tMax, 1)} s</span>
      </div>
    </figure>
  );
}

const TRACK_BOX = { width: 320, height: 160, padding: 16 };

function isNearTrack(
  track: readonly { lat: number; lng: number }[],
  point: { lat: number; lng: number },
): boolean {
  if (track.length === 0) return false;
  const lats = track.map((p) => p.lat);
  const lngs = track.map((p) => p.lng);
  const margin = 0.01; // ~1 km
  return (
    point.lat >= Math.min(...lats) - margin &&
    point.lat <= Math.max(...lats) + margin &&
    point.lng >= Math.min(...lngs) - margin &&
    point.lng <= Math.max(...lngs) + margin
  );
}

/** Schematic of the GPS window track (relative positions, no map tiles); the crash point is marked. */
export function DqTrackSketch({
  track,
  crash,
}: {
  track: readonly { lat: number; lng: number }[];
  crash: { lat: number; lng: number } | null;
}) {
  // Mark the crash point only when it lies on / near the window (a far-off point would squash the track).
  const near = crash && isNearTrack(track, crash) ? crash : null;
  const all = near ? [...track, near] : [...track];
  const projected = projectSosTrail(all, TRACK_BOX);
  const line = near ? projected.slice(0, -1) : projected;
  const crashPoint = near ? projected[projected.length - 1] : undefined;
  const first = line[0];
  if (line.length < 2 || !first) return null;
  return (
    <svg
      className="dq-track"
      viewBox={`0 0 ${String(TRACK_BOX.width)} ${String(TRACK_BOX.height)}`}
      role="img"
      aria-label={`GPS window track with ${String(track.length)} points${crash ? '; crash point marked' : ''}`}
      data-testid="dq-gps-track"
    >
      <polyline
        className="dq-track__line"
        points={line.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
      />
      <circle className="dq-track__start" cx={first.x} cy={first.y} r={4} />
      {crashPoint ? (
        <circle className="dq-track__crash" cx={crashPoint.x} cy={crashPoint.y} r={6} />
      ) : null}
    </svg>
  );
}
