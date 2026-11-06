import type { AdminDqTripEvent } from '@autolokate/api-client';

import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

/**
 * Pure helpers for the DriveQuant telemetry views (trip metrics, events, crash windows). Field names
 * and units follow DRIVEQUANT_DATA_MAPPING.md / the DriveQuant push docs — a key we don't know is
 * still shown, raw, never dropped. Nothing here logs or persists data.
 */

export type DqTone = 'danger' | 'warning' | 'info' | 'neutral';

/* ------------------------------------------------------------------------------------------------
 * Value formatting
 * ---------------------------------------------------------------------------------------------- */

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Up to `digits` decimals, trailing zeros trimmed (1.50 → "1.5", 7 → "7"). */
export function formatDqNumber(value: number, digits = 2): string {
  const fixed = value.toFixed(digits);
  return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
}

/** Seconds → "1 h 5 min", "12 min 3 s", "45 s". */
export function formatDqSeconds(seconds: number): string {
  const total = Math.round(Math.abs(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const sign = seconds < 0 ? '−' : '';
  if (h > 0) return `${sign}${String(h)} h ${String(m)} min`;
  if (m > 0) return `${sign}${String(m)} min${s ? ` ${String(s)} s` : ''}`;
  return `${sign}${String(s)} s`;
}

/** Offset since trip start as "+mm:ss" (or "+h:mm:ss"). */
export function formatDqOffset(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `+${String(h)}:${pad(m)}:${pad(s)}` : `+${pad(m)}:${pad(s)}`;
}

/** Crash probability: the API sends 0–100; tolerate a 0–1 fraction. */
export function formatDqProbability(value: number | null | undefined): string {
  if (!isFiniteNumber(value)) return '—';
  return `${String(Math.round(value <= 1 ? value * 100 : value))}%`;
}

/* ------------------------------------------------------------------------------------------------
 * Code labels (DriveQuant enums)
 * ---------------------------------------------------------------------------------------------- */

/** DriveQuant road context (`contextId` in the advanced* sections). */
const ROAD_CONTEXTS: Record<number, string> = {
  0: 'Traffic jam',
  1: 'Heavy urban traffic',
  2: 'City',
  3: 'Suburban',
  4: 'Expressway',
};

/** DriveKit transportation mode codes. Unknown codes render as "Mode n". */
const TRANSPORT_MODES: Record<number, string> = {
  0: 'Unknown',
  1: 'Car',
  2: 'Motorcycle',
  3: 'Truck',
  4: 'Bus',
  5: 'Train',
  6: 'Boat',
  7: 'Bike',
  8: 'Flight',
  9: 'Skiing',
  10: 'On foot',
  11: 'Idle',
  12: 'Other',
};

export function dqRoadContextLabel(id: unknown): string {
  return isFiniteNumber(id) ? (ROAD_CONTEXTS[id] ?? `Context ${String(id)}`) : '—';
}

export function dqTransportModeLabel(code: unknown): string | null {
  if (!isFiniteNumber(code)) return null;
  return `${TRANSPORT_MODES[code] ?? 'Mode'} (${String(code)})`;
}

/* ------------------------------------------------------------------------------------------------
 * Metric sections → groups, labels, units
 * ---------------------------------------------------------------------------------------------- */

export type DqMetricGroup = { id: string; title: string; sections: readonly string[] };

export const DQ_METRIC_GROUPS: readonly DqMetricGroup[] = [
  { id: 'safety', title: 'Safety', sections: ['safety', 'advancedSafety'] },
  { id: 'eco', title: 'Eco-driving', sections: ['ecoDriving', 'advancedEcoDriving'] },
  {
    id: 'fuel',
    title: 'Fuel & energy',
    sections: [
      'fuelEstimation',
      'advancedFuelEstimation',
      'energyEstimation',
      'advancedEnergyEstimation',
    ],
  },
  { id: 'distraction', title: 'Phone distraction', sections: ['driverDistraction'] },
  { id: 'speeding', title: 'Speeding', sections: ['speedingStatistics'] },
  { id: 'wear', title: 'Pollutants & wear', sections: ['pollutants', 'tireWear', 'brakeWear'] },
  {
    id: 'trip',
    title: 'Trip & conditions',
    sections: ['itineraryStatistics', 'occupantInfo', 'weather'],
  },
  { id: 'device', title: 'Vehicle & device', sections: ['vehicle', 'smartphoneData', 'beacon'] },
];

const SECTION_TITLES: Record<string, string> = {
  safety: 'Safety summary',
  advancedSafety: 'Safety by road context',
  ecoDriving: 'Eco-driving summary',
  advancedEcoDriving: 'Eco-driving by road context',
  fuelEstimation: 'Fuel & CO₂',
  advancedFuelEstimation: 'Fuel by road context',
  energyEstimation: 'Energy (EV)',
  advancedEnergyEstimation: 'Energy by road context',
  driverDistraction: 'Phone use',
  speedingStatistics: 'Speeding summary',
  pollutants: 'Pollutants',
  tireWear: 'Tyre wear',
  brakeWear: 'Brake wear',
  itineraryStatistics: 'Itinerary',
  occupantInfo: 'Occupant',
  weather: 'Weather',
  vehicle: 'DriveQuant vehicle model',
  smartphoneData: 'Phone & SDK',
  beacon: 'Beacon',
};

const KNOWN_SECTIONS = new Set(DQ_METRIC_GROUPS.flatMap((group) => group.sections));
/** Handled outside the grouped grid (advice list, unmapped key names). */
const SPECIAL_SECTIONS = new Set(['advice', 'unmappedKeys']);

type FieldSpec = { label?: string; unit?: string };

const CONTEXT_PCT: Record<string, FieldSpec> = {
  contextId: { label: 'Road context' },
  distance: { label: 'Share of distance', unit: '%' },
  duration: { label: 'Share of time', unit: '%' },
};

/** `section` (or `section.arrayKey[]` for rows) → field → label / unit. */
const FIELD_SPECS: Record<string, Record<string, FieldSpec>> = {
  itineraryStatistics: {
    tripDuration: { label: 'Trip duration', unit: 's' },
    drivingDuration: { label: 'Driving duration', unit: 's' },
    idlingDuration: { label: 'Idling duration', unit: 's' },
    drivingPercentage: { label: 'Driving share', unit: '%' },
    idlingPercentage: { label: 'Idling share', unit: '%' },
    distance: { label: 'Distance', unit: 'm' },
    speedMean: { label: 'Mean speed', unit: 'km/h' },
    subdispNb: { label: 'Sub-displacements' },
    meteo: { label: 'Weather code' },
    day: { label: 'Daytime' },
    weekDay: { label: 'Weekday' },
    transportationMode: { label: 'Transport mode' },
  },
  ecoDriving: {
    score: { label: 'Eco score', unit: '/10' },
    scoreAccel: { label: 'Acceleration score' },
    scoreMain: { label: 'Steady-speed score' },
    scoreDecel: { label: 'Deceleration score' },
    stdDevAccel: { label: 'Acceleration std. dev.' },
    stdDevMain: { label: 'Steady-speed std. dev.' },
    stdDevDecel: { label: 'Deceleration std. dev.' },
    energyClass: { label: 'Energy class' },
  },
  'advancedEcoDriving.ecoDrivingContext[]': {
    ...CONTEXT_PCT,
    efficiencyScore: { label: 'Efficiency', unit: '/10' },
    scoreAccel: { label: 'Accel.' },
    scoreMain: { label: 'Steady' },
    scoreDecel: { label: 'Decel.' },
  },
  fuelEstimation: {
    co2Mass: { label: 'CO₂ mass', unit: 'kg' },
    co2Emission: { label: 'CO₂ emission', unit: 'g/km' },
    fuelVolume: { label: 'Fuel used', unit: 'L' },
    fuelConsumption: { label: 'Fuel consumption', unit: 'L/100 km' },
    idleFuelVolume: { label: 'Idle fuel', unit: 'L' },
    idleFuelPercentage: { label: 'Idle fuel share', unit: '%' },
    idleFuelConsumption: { label: 'Idle fuel consumption' },
    idleCo2Emission: { label: 'Idle CO₂ emission' },
    idleCo2Mass: { label: 'Idle CO₂ mass', unit: 'kg' },
    engineTempStatus: { label: 'Engine warm' },
    coldFuelVolume: { label: 'Cold-engine fuel', unit: 'L' },
  },
  'advancedFuelEstimation.fuelEstimationContext[]': {
    ...CONTEXT_PCT,
    co2Mass: { label: 'CO₂', unit: 'kg' },
    co2Emission: { label: 'CO₂', unit: 'g/km' },
    fuelVolume: { label: 'Fuel', unit: 'L' },
    fuelConsumption: { label: 'Consumption', unit: 'L/100 km' },
  },
  energyEstimation: {
    energy: { label: 'Energy used', unit: 'kWh' },
    energyConsumption: { label: 'Energy consumption', unit: 'kWh/100 km' },
    energyOpti: { label: 'Optimal energy', unit: 'kWh' },
    energyOptiConsumption: { label: 'Optimal consumption', unit: 'kWh/100 km' },
  },
  'advancedEnergyEstimation[]': {
    ...CONTEXT_PCT,
    energy: { label: 'Energy', unit: 'kWh' },
    energyConsumption: { label: 'Consumption', unit: 'kWh/100 km' },
    energyOpti: { label: 'Optimal', unit: 'kWh' },
    energyOptiConsumption: { label: 'Optimal cons.', unit: 'kWh/100 km' },
  },
  safety: {
    safetyScore: { label: 'Safety score', unit: '/10' },
    nbAdh: { label: 'Adherence events' },
    nbAccel: { label: 'Acceleration events' },
    nbDecel: { label: 'Braking events' },
    nbAdhCrit: { label: 'Critical adherence' },
    nbAccelCrit: { label: 'Critical acceleration' },
    nbDecelCrit: { label: 'Critical braking' },
  },
  'advancedSafety.safetyContext[]': {
    ...CONTEXT_PCT,
    safetyScore: { label: 'Score', unit: '/10' },
    nbAdh: { label: 'Adh.' },
    nbAccel: { label: 'Accel.' },
    nbDecel: { label: 'Brake' },
    nbAdhCrit: { label: 'Adh. crit.' },
    nbAccelCrit: { label: 'Accel. crit.' },
    nbDecelCrit: { label: 'Brake crit.' },
  },
  driverDistraction: {
    score: { label: 'Distraction score', unit: '/10' },
    scoreUnlock: { label: 'Unlock score', unit: '/10' },
    scoreCall: { label: 'Call score', unit: '/10' },
    nbUnlock: { label: 'Screen unlocks' },
    durationUnlock: { label: 'Unlocked time', unit: 's' },
    durationPercentUnlock: { label: 'Unlocked time share', unit: '%' },
    distanceUnlock: { label: 'Unlocked distance', unit: 'm' },
    distancePercentUnlock: { label: 'Unlocked distance share', unit: '%' },
  },
  'driverDistraction.calls[]': {
    id: { label: '#' },
    start: { label: 'Start', unit: 's' },
    end: { label: 'End', unit: 's' },
    durationS: { label: 'Duration', unit: 's' },
    duration: { label: 'Time share', unit: '%' },
    distanceM: { label: 'Distance', unit: 'm' },
    distance: { label: 'Distance share', unit: '%' },
    status: { label: 'Direction' },
    audioSystem: { label: 'Audio' },
    forbidden: { label: 'Forbidden' },
  },
  speedingStatistics: {
    score: { label: 'Speeding score', unit: '/10' },
    distance: { label: 'Distance', unit: 'm' },
    duration: { label: 'Duration', unit: 's' },
    speedingDistance: { label: 'Speeding distance', unit: 'm' },
    speedingDuration: { label: 'Speeding duration', unit: 's' },
  },
  'speedingStatistics.speedLimitContexts[]': {
    speedLimit: { label: 'Limit', unit: 'km/h' },
    distance: { label: 'Distance', unit: 'm' },
    duration: { label: 'Duration', unit: 's' },
    speedingDistance: { label: 'Speeding dist.', unit: 'm' },
    speedingDuration: { label: 'Speeding time', unit: 's' },
    score: { label: 'Score', unit: '/10' },
  },
  pollutants: {
    co: { label: 'CO', unit: 'mg/km' },
    hc: { label: 'HC', unit: 'mg/km' },
    nox: { label: 'NOx', unit: 'mg/km' },
    soot: { label: 'Soot', unit: 'mg/km' },
  },
  tireWear: {
    frontTireDistance: { label: 'Front tyre distance', unit: 'km' },
    rearTireDistance: { label: 'Rear tyre distance', unit: 'km' },
    frontTireAutonomy: { label: 'Front tyre autonomy', unit: 'km' },
    rearTireAutonomy: { label: 'Rear tyre autonomy', unit: 'km' },
    frontTireTotalWear: { label: 'Front tyre total wear', unit: '%' },
    rearTireTotalWear: { label: 'Rear tyre total wear', unit: '%' },
  },
  brakeWear: {
    frontBrakeDistance: { label: 'Front brake distance', unit: 'km' },
    rearBrakeDistance: { label: 'Rear brake distance', unit: 'km' },
    frontBrakeAutonomy: { label: 'Front brake autonomy', unit: 'km' },
    rearBrakeAutonomy: { label: 'Rear brake autonomy', unit: 'km' },
    frontBrakeTotalWear: { label: 'Front pad total wear', unit: '%' },
    rearBrakeTotalWear: { label: 'Rear pad total wear', unit: '%' },
  },
  occupantInfo: {
    role: { label: 'Role' },
    passengerProbability: { label: 'Passenger probability', unit: '%' },
    passengerPredictionVersion: { label: 'Prediction model' },
  },
  weather: {
    temperature: { label: 'Temperature', unit: '°C' },
    windSpeed: { label: 'Wind speed', unit: 'm/s' },
    windDegree: { label: 'Wind direction', unit: '°' },
    pressure: { label: 'Pressure', unit: 'hPa' },
    precipitation: { label: 'Precipitation', unit: 'mm' },
    humidity: { label: 'Humidity', unit: '%' },
    cloud: { label: 'Cloud cover', unit: '%' },
    visibility: { label: 'Visibility', unit: 'm' },
  },
  vehicle: {
    power: { label: 'Power', unit: 'hp' },
    mass: { label: 'Mass', unit: 'kg' },
    engineDisplacement: { label: 'Engine displacement', unit: 'cm³' },
    consumption: { label: 'Rated consumption', unit: 'L/100 km' },
    length: { label: 'Length', unit: 'm' },
    width: { label: 'Width', unit: 'm' },
    height: { label: 'Height', unit: 'm' },
    'statistics.distance': { label: 'Statistics · distance', unit: 'km' },
    'statistics.analyzedDistance': { label: 'Statistics · analysed distance', unit: 'km' },
    'statistics.estimatedYearDistance': { label: 'Statistics · est. yearly distance', unit: 'km' },
  },
  smartphoneData: {
    batteryPercent: { label: 'Battery', unit: '%' },
  },
  // Crash Report push sections (DriveQuant crash report units).
  driverFatigue: {
    tripDistance: { label: 'Trip distance', unit: 'km' },
    tripDuration: { label: 'Trip duration', unit: 's' },
    last12HoursDistance: { label: 'Distance in last 12 h', unit: 'km' },
    last12HoursDuration: { label: 'Driving in last 12 h', unit: 's' },
    breakTime: { label: 'Break time', unit: 's' },
  },
  phoneUsage: {
    callDurationTrip: { label: 'Call duration (trip)', unit: 's' },
    callForbiddenDurationTrip: { label: 'Forbidden call duration (trip)', unit: 's' },
    distractionToCrashTime: { label: 'Distraction → crash', unit: 's' },
  },
  speeding: {
    speedingDistanceTrip: { label: 'Speeding distance (trip)', unit: 'm' },
    speedingDurationTrip: { label: 'Speeding duration (trip)', unit: 's' },
  },
};

/** DriveQuant scores use 11 for "not scored". */
const UNSCORED = 11;

export function dqSectionTitle(section: string): string {
  return SECTION_TITLES[section] ?? humanizeAdminLabel(section);
}

function fieldSpec(scope: string, field: string): FieldSpec {
  return FIELD_SPECS[scope]?.[field] ?? {};
}

/** One scalar value with its unit, DriveQuant-aware ("Not scored", road context, transport mode). */
export function formatDqMetricValue(
  scope: string,
  field: string,
  value: unknown,
  unit: string | undefined = fieldSpec(scope, field).unit,
): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (isFiniteNumber(value)) {
    if (field === 'contextId') return dqRoadContextLabel(value);
    if (field === 'transportationMode') return dqTransportModeLabel(value) ?? '—';
    if (unit === '/10' && value === UNSCORED) return 'Not scored';
    if (unit === 's' && Math.abs(value) >= 60) return formatDqSeconds(value);
    const text = formatDqNumber(value);
    if (!unit) return text;
    return unit === '/10' || unit === '%' || unit === '°' ? `${text}${unit}` : `${text} ${unit}`;
  }
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

export type DqMetricRow = { key: string; label: string; value: string };
export type DqMetricTable = {
  key: string;
  title: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
};
export type DqMetricSection = {
  key: string;
  title: string;
  rows: DqMetricRow[];
  tables: DqMetricTable[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.length > 0 && value.every(isPlainObject);
}

function buildTable(scope: string, key: string, title: string, items: Record<string, unknown>[]) {
  const fieldKeys: string[] = [];
  for (const item of items) {
    for (const field of Object.keys(item)) if (!fieldKeys.includes(field)) fieldKeys.push(field);
  }
  return {
    key,
    title,
    columns: fieldKeys.map((field) => {
      const spec = fieldSpec(scope, field);
      const label = spec.label ?? humanizeAdminLabel(field);
      const unit = spec.unit && spec.unit !== '/10' ? ` (${spec.unit})` : '';
      return { key: field, label: `${label}${unit}` };
    }),
    rows: items.map((item) =>
      Object.fromEntries(
        fieldKeys.map((field) => {
          const spec = fieldSpec(scope, field);
          // Column headers carry the unit; cells stay compact (seconds stay raw numbers).
          const unit = spec.unit === '/10' ? spec.unit : undefined;
          return [field, formatDqMetricValue(scope, field, item[field], unit)];
        }),
      ),
    ),
  };
}

/** Flatten one metric section into labelled scalar rows + tables for array-of-object fields. */
export function buildDqMetricSection(section: string, value: unknown): DqMetricSection {
  const title = dqSectionTitle(section);
  const rows: DqMetricRow[] = [];
  const tables: DqMetricTable[] = [];
  if (isObjectArray(value)) {
    tables.push(buildTable(`${section}[]`, section, title, value));
    return { key: section, title, rows, tables };
  }
  const walk = (obj: Record<string, unknown>, prefix: string) => {
    for (const [field, fieldValue] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${field}` : field;
      if (isObjectArray(fieldValue)) {
        tables.push(
          buildTable(
            `${section}.${path}[]`,
            `${section}.${path}`,
            humanizeAdminLabel(field),
            fieldValue,
          ),
        );
      } else if (isPlainObject(fieldValue)) {
        walk(fieldValue, path);
      } else {
        const spec = fieldSpec(section, path);
        const label =
          spec.label ??
          (prefix
            ? `${humanizeAdminLabel(prefix.replace(/\./g, ' '))} · ${field}`
            : humanizeAdminLabel(field));
        const shown = Array.isArray(fieldValue)
          ? fieldValue.length === 0
            ? '—'
            : fieldValue.map((v) => formatDqMetricValue(section, path, v)).join(', ')
          : formatDqMetricValue(section, path, fieldValue);
        rows.push({ key: path, label, value: shown });
      }
    }
  };
  if (isPlainObject(value)) walk(value, '');
  else rows.push({ key: section, label: title, value: formatDqMetricValue(section, '', value) });
  return { key: section, title, rows, tables };
}

export type DqAdvice = {
  id: string | null;
  messageId: string | null;
  title: string | null;
  theme: number | null;
};

export type DqMetricsView = {
  groups: { id: string; title: string; sections: DqMetricSection[] }[];
  advice: DqAdvice[];
  /** Top-level push keys DriveQuant sent that the backend does not map yet (names only). */
  unmappedKeys: string[];
  /** Metric sections this UI has no group for — rendered raw. */
  unknown: { key: string; value: unknown }[];
};

/** Group a `telemetry.metrics` object; only sections present are returned. */
export function buildDqMetricsView(
  metrics: Record<string, unknown> | null | undefined,
): DqMetricsView {
  const source = metrics ?? {};
  const groups = DQ_METRIC_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    sections: group.sections
      .filter((section) => source[section] !== undefined && source[section] !== null)
      .map((section) => buildDqMetricSection(section, source[section])),
  })).filter((group) => group.sections.length > 0);
  const advice = Array.isArray(source.advice)
    ? source.advice.filter(isPlainObject).map((item) => ({
        id: typeof item.id === 'string' ? item.id : null,
        messageId: typeof item.messageId === 'string' ? item.messageId : null,
        title: typeof item.title === 'string' ? item.title : null,
        theme: isFiniteNumber(item.theme) ? item.theme : null,
      }))
    : [];
  const unmappedKeys = Array.isArray(source.unmappedKeys)
    ? source.unmappedKeys.filter((key): key is string => typeof key === 'string')
    : [];
  const unknown = Object.entries(source)
    .filter(([key]) => !KNOWN_SECTIONS.has(key) && !SPECIAL_SECTIONS.has(key))
    .map(([key, value]) => ({ key, value }));
  return { groups, advice, unmappedKeys, unknown };
}

/** Transport mode + occupant role (driver / passenger) read from the trip metrics, when present. */
export function dqTripContext(metrics: Record<string, unknown> | null | undefined): {
  transport: string | null;
  occupant: string | null;
  passengerProbability: number | null;
} {
  const itinerary = isPlainObject(metrics?.itineraryStatistics)
    ? metrics.itineraryStatistics
    : null;
  const occupant = isPlainObject(metrics?.occupantInfo) ? metrics.occupantInfo : null;
  return {
    transport: dqTransportModeLabel(itinerary?.transportationMode),
    occupant: typeof occupant?.role === 'string' ? humanizeAdminLabel(occupant.role) : null,
    passengerProbability: isFiniteNumber(occupant?.passengerProbability)
      ? occupant.passengerProbability
      : null,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Trip events
 * ---------------------------------------------------------------------------------------------- */

export function dqEventLabel(event: Pick<AdminDqTripEvent, 'kind' | 'type'>): string {
  const { kind, type } = event;
  switch (kind) {
    case 'SAFETY':
      return type === 1
        ? 'Loss of adherence'
        : type === 2
          ? 'Harsh acceleration'
          : type === 3
            ? 'Harsh braking'
            : 'Safety event';
    case 'DISTRACTION':
      return type === 1 ? 'Screen unlocked' : type === 2 ? 'Screen locked' : 'Phone distraction';
    case 'CALL':
      return type === 3 ? 'Call started' : type === 4 ? 'Call ended' : 'Phone call';
    case 'SPEEDING':
      return type === 1 ? 'Speeding started' : type === 0 ? 'Speeding ended' : 'Speeding';
    case 'STOP':
      return 'Vehicle stop';
    default:
      return humanizeAdminLabel(kind);
  }
}

/** Severity chip for an event, or null when DriveQuant reports none. */
export function dqEventSeverity(
  event: Pick<AdminDqTripEvent, 'kind' | 'type' | 'level' | 'attrs'>,
): { label: string; tone: DqTone } | null {
  if (event.kind === 'SAFETY') {
    if (event.level === 2) return { label: 'Harsh', tone: 'danger' };
    if (event.level === 1) return { label: 'Strong', tone: 'warning' };
    return null;
  }
  if (event.kind === 'CALL' && event.attrs.forbidden === true) {
    return { label: 'Forbidden call', tone: 'warning' };
  }
  if (event.kind === 'SPEEDING' && event.type === 1)
    return { label: 'Over limit', tone: 'warning' };
  return null;
}

/** Measured details of an event ("−2 m/s² · 27.6 km/h · 1.8 km in"). */
export function dqEventDetail(event: AdminDqTripEvent): string {
  const parts: string[] = [];
  if (isFiniteNumber(event.value) && event.kind === 'SAFETY') {
    parts.push(
      event.type === 1
        ? `adherence ${formatDqNumber(event.value)}`
        : `${formatDqNumber(event.value)} m/s²`,
    );
  }
  if (isFiniteNumber(event.velocityKmh)) parts.push(`${formatDqNumber(event.velocityKmh, 1)} km/h`);
  if (isFiniteNumber(event.durationS)) parts.push(`lasted ${formatDqSeconds(event.durationS)}`);
  if (isFiniteNumber(event.distanceM)) {
    parts.push(`${formatDqNumber(event.distanceM / 1000, 1)} km into the trip`);
  }
  if (typeof event.attrs.callType === 'string')
    parts.push(humanizeAdminLabel(event.attrs.callType));
  if (typeof event.attrs.audioSystem === 'string') {
    parts.push(`audio ${humanizeAdminLabel(event.attrs.audioSystem)}`);
  }
  return parts.join(' · ');
}

/** Events in trip order (offset, then DriveQuant sequence). */
export function sortDqEvents(events: readonly AdminDqTripEvent[]): AdminDqTripEvent[] {
  return [...events].sort((a, b) => {
    const ao = a.offsetS ?? Number.POSITIVE_INFINITY;
    const bo = b.offsetS ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1;
    return a.seq - b.seq;
  });
}

export function countDqEventsByKind(events: readonly AdminDqTripEvent[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) out[event.kind] = (out[event.kind] ?? 0) + 1;
  return out;
}

/* ------------------------------------------------------------------------------------------------
 * Crashes
 * ---------------------------------------------------------------------------------------------- */

export function dqCrashStateMeta(state: string): { label: string; tone: DqTone } {
  switch (state) {
    case 'CONFIRMED':
      return { label: 'Confirmed crash', tone: 'danger' };
    case 'UNCONFIRMED':
      return { label: 'Unconfirmed', tone: 'warning' };
    case 'FAILED_TO_PREDICT':
      return { label: 'Prediction failed', tone: 'neutral' };
    default:
      return { label: humanizeAdminLabel(state), tone: 'neutral' };
  }
}

export function dqRiskTone(level: unknown): DqTone {
  if (level === 'HIGH') return 'danger';
  if (level === 'MEDIUM') return 'warning';
  if (level === 'LOW') return 'info';
  return 'neutral';
}

export type DqSeriesPoint = { t: number; v: number };

/** Pair a time series with a value series (non-numeric / mismatched entries dropped). */
export function pairDqSeries(
  time: readonly unknown[] | undefined,
  values: readonly unknown[] | undefined,
  timeScale = 1,
): DqSeriesPoint[] {
  if (!Array.isArray(time) || !Array.isArray(values)) return [];
  const length = Math.min(time.length, values.length);
  const out: DqSeriesPoint[] = [];
  for (let i = 0; i < length; i += 1) {
    const t: unknown = time[i];
    const v: unknown = values[i];
    if (isFiniteNumber(t) && isFiniteNumber(v)) out.push({ t: t * timeScale, v });
  }
  return out;
}

/** Keep at most `max` points, always including the extremes of each bucket (min/max decimation). */
export function decimateDqSeries(points: readonly DqSeriesPoint[], max = 400): DqSeriesPoint[] {
  if (points.length <= max) return [...points];
  const bucketSize = Math.ceil(points.length / Math.floor(max / 2));
  const out: DqSeriesPoint[] = [];
  for (let start = 0; start < points.length; start += bucketSize) {
    const bucket = points.slice(start, start + bucketSize);
    let lo = bucket[0];
    let hi = bucket[0];
    for (const p of bucket) {
      if (lo && p.v < lo.v) lo = p;
      if (hi && p.v > hi.v) hi = p;
    }
    if (!lo || !hi) continue;
    if (lo === hi) out.push(lo);
    else if (lo.t <= hi.t) out.push(lo, hi);
    else out.push(hi, lo);
  }
  return out;
}

export type DqCrashChart = {
  key: string;
  label: string;
  unit: string;
  points: DqSeriesPoint[];
  /** Impact time on the chart's time axis (s), when the window metadata allows it. */
  impactT: number | null;
};

function windowValue(features: Record<string, unknown> | null, key: string): number | null {
  const windows = isPlainObject(features?.windows) ? features.windows : null;
  const value = windows?.[key];
  return isFiniteNumber(value) ? value : null;
}

const GPS_SERIES: Record<string, { label: string; unit: string }> = {
  velocity: { label: 'Speed', unit: 'km/h' },
  accuracy: { label: 'GPS accuracy', unit: 'm' },
  heading: { label: 'Heading', unit: '°' },
  elevation: { label: 'Elevation', unit: 'm' },
};

/** GPS window charts (time in s from the start of the window). Lat/lng go to the track sketch. */
export function dqGpsCharts(
  gps: Record<string, number[]> | null,
  features: Record<string, unknown> | null,
): DqCrashChart[] {
  if (!gps) return [];
  const impactT = windowValue(features, 'gpsWindowNeg');
  return Object.entries(GPS_SERIES)
    .map(([key, meta]) => ({
      key,
      ...meta,
      points: decimateDqSeries(pairDqSeries(gps.timestamp, gps[key])),
      impactT,
    }))
    .filter((chart) => chart.points.length > 1);
}

/** IMU window charts: every numeric series besides `timestamp` (ms → s). */
export function dqImuCharts(
  imu: Record<string, number[]> | null,
  features: Record<string, unknown> | null,
): DqCrashChart[] {
  if (!imu) return [];
  const impactT = windowValue(features, 'imuWindowNeg');
  return Object.keys(imu)
    .filter((key) => key !== 'timestamp' && Array.isArray(imu[key]))
    .map((key) => {
      const axis = /([XYZ])$/.exec(key)?.[1];
      const isAccel = key.startsWith('acceleration');
      const isGyro = /^gyro/i.test(key) || key.startsWith('rotation');
      const label = isAccel
        ? `Acceleration ${axis ?? ''}`.trim()
        : isGyro
          ? `Gyroscope ${axis ?? ''}`.trim()
          : humanizeAdminLabel(key);
      return {
        key,
        label,
        unit: isAccel ? 'mG' : '',
        points: decimateDqSeries(pairDqSeries(imu.timestamp, imu[key], 1 / 1000)),
        impactT,
      };
    })
    .filter((chart) => chart.points.length > 1);
}

/** GPS window lat/lng pairs (0/0 and out-of-range points dropped). */
export function dqGpsTrack(gps: Record<string, number[]> | null): { lat: number; lng: number }[] {
  if (!gps) return [];
  const lat = gps.latitude;
  const lng = gps.longitude;
  if (!Array.isArray(lat) || !Array.isArray(lng)) return [];
  const out: { lat: number; lng: number }[] = [];
  for (let i = 0; i < Math.min(lat.length, lng.length); i += 1) {
    const a = lat[i];
    const b = lng[i];
    if (!isFiniteNumber(a) || !isFiniteNumber(b)) continue;
    if (Math.abs(a) > 90 || Math.abs(b) > 180 || (a === 0 && b === 0)) continue;
    out.push({ lat: a, lng: b });
  }
  return out;
}

/** Chart geometry: map points into a box; returns the polyline + scale helpers. */
export function projectDqSeries(
  points: readonly DqSeriesPoint[],
  box: { width: number; height: number; padX: number; padY: number },
): {
  path: string;
  min: number;
  max: number;
  tMin: number;
  tMax: number;
  x: (t: number) => number;
  y: (v: number) => number;
} {
  const ts = points.map((p) => p.t);
  const vs = points.map((p) => p.v);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const tSpan = Math.max(tMax - tMin, 1e-9);
  const vSpan = Math.max(max - min, 1e-9);
  const innerW = box.width - box.padX * 2;
  const innerH = box.height - box.padY * 2;
  const x = (t: number) => box.padX + ((t - tMin) / tSpan) * innerW;
  const y = (v: number) =>
    max === min ? box.padY + innerH / 2 : box.padY + (1 - (v - min) / vSpan) * innerH;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(' ');
  return { path, min, max, tMin, tMax, x, y };
}
