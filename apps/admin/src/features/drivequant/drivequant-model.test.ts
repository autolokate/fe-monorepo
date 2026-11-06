import { describe, expect, it } from 'vitest';

import { DQ_CRASH_TELEMETRY, DQ_TRIP_DETAIL } from '../../../e2e/helpers/drivequant-fixtures';

import {
  buildDqMetricSection,
  buildDqMetricsView,
  countDqEventsByKind,
  decimateDqSeries,
  dqCrashStateMeta,
  dqEventDetail,
  dqEventLabel,
  dqEventSeverity,
  dqGpsCharts,
  dqGpsTrack,
  dqImuCharts,
  dqTripContext,
  formatDqMetricValue,
  formatDqOffset,
  formatDqProbability,
  formatDqSeconds,
  pairDqSeries,
  sortDqEvents,
} from './drivequant-model';

const telemetry = DQ_TRIP_DETAIL.telemetry;
if (!telemetry) throw new Error('fixture must carry telemetry');

describe('DriveQuant metric grouping (doc trip sample)', () => {
  const view = buildDqMetricsView(telemetry.metrics);

  it('groups every known section present and keeps group order', () => {
    expect(view.groups.map((g) => g.id)).toEqual([
      'safety',
      'eco',
      'fuel',
      'distraction',
      'speeding',
      'wear',
      'trip',
      'device',
    ]);
    const sections = view.groups.flatMap((g) => g.sections.map((s) => s.key));
    for (const key of Object.keys(telemetry.metrics)) {
      if (key === 'advice' || key === 'unmappedKeys') continue;
      expect(sections).toContain(key);
    }
    expect(view.unknown).toEqual([]);
  });

  it('labels values with DriveQuant units', () => {
    const itinerary = buildDqMetricSection(
      'itineraryStatistics',
      telemetry.metrics.itineraryStatistics,
    );
    const byKey = Object.fromEntries(itinerary.rows.map((row) => [row.key, row]));
    expect(byKey.distance).toEqual({ key: 'distance', label: 'Distance', value: '15801 m' });
    expect(byKey.tripDuration?.value).toBe('33 min 16 s');
    expect(byKey.speedMean?.value).toBe('30.5 km/h');
    expect(byKey.transportationMode?.value).toBe('Car (1)');
    const pollutants = buildDqMetricSection('pollutants', telemetry.metrics.pollutants);
    expect(pollutants.rows.find((row) => row.key === 'nox')?.value).toBe('43.45 mg/km');
  });

  it('renders road-context arrays as tables (11 = not scored, contextId named)', () => {
    const safety = buildDqMetricSection('advancedSafety', telemetry.metrics.advancedSafety);
    const table = safety.tables[0];
    expect(table?.columns.map((c) => c.label)).toContain('Share of distance (%)');
    expect(table?.rows[0]?.contextId).toBe('Traffic jam');
    expect(table?.rows[0]?.safetyScore).toBe('Not scored');
  });

  it('nests driverDistraction.calls and speedLimitContexts as tables', () => {
    const distraction = buildDqMetricSection(
      'driverDistraction',
      telemetry.metrics.driverDistraction,
    );
    expect(distraction.tables.map((t) => t.key)).toEqual(['driverDistraction.calls']);
    const speeding = buildDqMetricSection(
      'speedingStatistics',
      telemetry.metrics.speedingStatistics,
    );
    expect(speeding.tables[0]?.columns[0]?.label).toBe('Limit (km/h)');
  });

  it('flattens nested objects (vehicle.statistics) with units', () => {
    const vehicle = buildDqMetricSection('vehicle', telemetry.metrics.vehicle);
    expect(vehicle.rows.find((r) => r.key === 'statistics.analyzedDistance')?.value).toMatch(
      / km$/,
    );
    expect(vehicle.rows.find((r) => r.key === 'extraData.declaredYear')?.value).toBe('2014');
  });

  it('keeps advice ids/titles and surfaces unknown sections raw', () => {
    expect(view.advice[0]?.id).toBe('5da5b749e3f4d636f1f3376e');
    const withUnknown = buildDqMetricsView({ futureThing: { a: 1 }, unmappedKeys: ['newKey'] });
    expect(withUnknown.unknown).toEqual([{ key: 'futureThing', value: { a: 1 } }]);
    expect(withUnknown.unmappedKeys).toEqual(['newKey']);
    expect(buildDqMetricsView(null).groups).toEqual([]);
  });

  it('reads transport + occupant for the summary', () => {
    expect(dqTripContext(telemetry.metrics)).toEqual({
      transport: 'Car (1)',
      occupant: 'Driver',
      passengerProbability: 12,
    });
    expect(dqTripContext(null).transport).toBeNull();
  });
});

describe('DriveQuant events', () => {
  const events = sortDqEvents(telemetry.events);

  it('sorts by offset and counts by kind', () => {
    const offsets = events.map((e) => e.offsetS ?? Infinity);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
    const counts = countDqEventsByKind(events);
    expect(Object.keys(counts).sort()).toEqual([
      'CALL',
      'DISTRACTION',
      'SAFETY',
      'SPEEDING',
      'STOP',
    ]);
  });

  it('labels, severity and detail follow the DTO codes', () => {
    const braking = telemetry.events.find((e) => e.kind === 'SAFETY' && e.type === 3);
    expect(braking && dqEventLabel(braking)).toBe('Harsh braking');
    expect(braking && dqEventSeverity(braking)).toEqual({ label: 'Strong', tone: 'warning' });
    expect(braking && dqEventDetail(braking)).toContain('m/s²');
    const call = telemetry.events.find((e) => e.kind === 'CALL' && e.type === 3);
    expect(call && dqEventLabel(call)).toBe('Call started');
    expect(call && dqEventSeverity(call)?.label).toBe('Forbidden call');
    expect(dqEventLabel({ kind: 'STOP', type: null })).toBe('Vehicle stop');
    expect(dqEventLabel({ kind: 'NEW_KIND', type: 1 })).toBe('New Kind');
  });
});

describe('DriveQuant crash windows (doc crash sample)', () => {
  it('builds GPS charts with the impact at gpsWindowNeg', () => {
    const charts = dqGpsCharts(DQ_CRASH_TELEMETRY.gps, DQ_CRASH_TELEMETRY.features);
    expect(charts.map((c) => c.key)).toEqual(['velocity', 'accuracy', 'heading', 'elevation']);
    expect(charts[0]?.impactT).toBe(20);
    // accuracy has one more sample than timestamp: pairs are cut to the shorter series.
    expect(charts[1]?.points).toHaveLength(4);
  });

  it('builds IMU charts in seconds with axis labels', () => {
    const charts = dqImuCharts(DQ_CRASH_TELEMETRY.imu, DQ_CRASH_TELEMETRY.features);
    expect(charts.map((c) => c.label)).toEqual([
      'Acceleration X',
      'Acceleration Y',
      'Acceleration Z',
    ]);
    expect(charts[0]?.unit).toBe('mG');
    expect(charts[0]?.points.at(-1)?.t).toBeCloseTo(14.98);
    expect(charts[0]?.impactT).toBe(5);
    const gyro = dqImuCharts({ timestamp: [0, 10], gyroscopeX: [1, 2] }, null);
    expect(gyro[0]?.label).toBe('Gyroscope X');
    expect(gyro[0]?.impactT).toBeNull();
  });

  it('track drops invalid points; null windows give nothing', () => {
    expect(dqGpsTrack(DQ_CRASH_TELEMETRY.gps)).toHaveLength(4);
    expect(dqGpsTrack({ latitude: [0, 91, 10], longitude: [0, 1, 20] })).toEqual([
      { lat: 10, lng: 20 },
    ]);
    expect(dqGpsCharts(null, null)).toEqual([]);
    expect(dqImuCharts(null, null)).toEqual([]);
  });

  it('pairs + decimates long series keeping extremes', () => {
    const t = Array.from({ length: 1500 }, (_, i) => i);
    const v = t.map((i) => (i === 700 ? 5000 : Math.sin(i / 50)));
    const points = decimateDqSeries(pairDqSeries(t, v), 300);
    expect(points.length).toBeLessThanOrEqual(300);
    expect(points.some((p) => p.v === 5000)).toBe(true);
    expect(pairDqSeries([0, 'x', 2], [1, 2, 'y'])).toEqual([{ t: 0, v: 1 }]);
  });

  it('state + probability formatting', () => {
    expect(dqCrashStateMeta('CONFIRMED').tone).toBe('danger');
    expect(dqCrashStateMeta('FAILED_TO_PREDICT').label).toBe('Prediction failed');
    expect(formatDqProbability(78)).toBe('78%');
    expect(formatDqProbability(0.5)).toBe('50%');
    expect(formatDqProbability(null)).toBe('—');
  });
});

describe('formatting helpers', () => {
  it('durations and offsets', () => {
    expect(formatDqSeconds(45)).toBe('45 s');
    expect(formatDqSeconds(3725)).toBe('1 h 2 min');
    expect(formatDqOffset(198)).toBe('+03:18');
    expect(formatDqOffset(3725)).toBe('+1:02:05');
  });

  it('metric values', () => {
    expect(formatDqMetricValue('safety', 'safetyScore', 9.1)).toBe('9.1/10');
    expect(formatDqMetricValue('safety', 'safetyScore', 11)).toBe('Not scored');
    expect(formatDqMetricValue('itineraryStatistics', 'day', true)).toBe('Yes');
    expect(formatDqMetricValue('x', 'y', null)).toBe('—');
    expect(formatDqMetricValue('x', 'y', 'text')).toBe('text');
  });
});
