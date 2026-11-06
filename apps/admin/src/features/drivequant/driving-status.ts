import type { AdminUserVehicleDto } from '@autolokate/api-client';

import type { DqTone } from '@/features/drivequant/drivequant-model';
import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';

/**
 * Operator-facing status mapping for Driving Activity (trips, crash events, safety alerts). Every
 * label here is provider-neutral; the wire enums stay as the backend sends them. Unknown values are
 * shown humanised, never dropped or guessed.
 */

export type DrivingStatus = { label: string; tone: DqTone; hint?: string };

/* ------------------------------------------------------------------------------------------------
 * Time, duration, rounding (IST)
 * ---------------------------------------------------------------------------------------------- */

const IST_DATE_TIME = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const IST_TIME_SECONDS = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "06 Nov 2026, 05:26 pm IST" — every driving timestamp is shown in IST, labelled. */
export function formatIst(value: string | null | undefined): string {
  const date = parse(value);
  return date ? `${IST_DATE_TIME.format(date)} IST` : '—';
}

/** "05:26:07 pm IST" — for events inside one trip / crash window. */
export function formatIstTime(value: string | null | undefined): string {
  const date = parse(value);
  return date ? `${IST_TIME_SECONDS.format(date)} IST` : '—';
}

/**
 * A `YYYY-MM-DD` date picked by the operator, as the instant its IST day starts (plus `addDays`).
 * Trip filters are IST days, whatever the browser's zone.
 */
export function istDayStartIso(day: string, addDays = 0): string {
  const start = new Date(`${day}T00:00:00+05:30`);
  if (Number.isNaN(start.getTime())) return day;
  return new Date(start.getTime() + addDays * 86_400_000).toISOString();
}

/** Whole minutes → "45 min", "1 h 05 min". */
export function formatMinutes(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '—';
  const total = Math.round(value);
  if (total < 60) return `${String(total)} min`;
  return `${String(Math.floor(total / 60))} h ${String(total % 60).padStart(2, '0')} min`;
}

/** Distance in km, one decimal ("18.4 km"). */
export function formatKm(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)} km` : '—';
}

/** Speed in km/h, whole numbers ("23 km/h"). */
export function formatKmh(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${String(Math.round(value))} km/h`
    : '—';
}

/** A 0–10 trip / driver score, one decimal; 11 is the provider's "not scored" marker. */
export function formatScore(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  if (value === 11) return 'Not scored';
  return value.toFixed(1);
}

/** Crash probability: the server sends an integer 0–100 (never a fraction). */
export function formatProbability(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${String(Math.round(value))}%`
    : '—';
}

/* ------------------------------------------------------------------------------------------------
 * Crash events
 * ---------------------------------------------------------------------------------------------- */

/** `state` → status chip. FAILED_TO_PREDICT is never auto-escalated: an operator must review it. */
export function crashStateStatus(state: string): DrivingStatus {
  switch (state) {
    case 'CONFIRMED':
      return { label: 'Confirmed crash', tone: 'danger' };
    case 'UNCONFIRMED':
      return {
        label: 'Unconfirmed',
        tone: 'neutral',
        hint: 'The detector did not confirm a crash. No escalation.',
      };
    case 'FAILED_TO_PREDICT':
      return {
        label: 'Needs review',
        tone: 'warning',
        hint: 'The detector could not classify this event. It was not escalated — review it.',
      };
    default:
      return { label: humanizeAdminLabel(state), tone: 'neutral' };
  }
}

/** `outcome` → what happened to the event (escalation). */
export function crashOutcomeStatus(outcome: string, state?: string): DrivingStatus {
  switch (outcome) {
    case 'DISPATCHED':
      return { label: 'Escalated to SOS', tone: 'info' };
    case 'UNCONFIRMED':
      return state === 'FAILED_TO_PREDICT'
        ? { label: 'Not escalated — review', tone: 'warning' }
        : { label: 'Not escalated', tone: 'neutral' };
    case 'NO_VEHICLE':
      return {
        label: 'Not escalated — no vehicle',
        tone: 'danger',
        hint: 'Confirmed crash with no vehicle on the account; the user was told to tap SOS.',
      };
    case 'NOT_ENTITLED':
      return { label: 'Not escalated — not entitled', tone: 'warning' };
    case 'CANCELLED':
      return { label: 'Cancelled by user', tone: 'neutral', hint: 'The user tapped “I’m OK”.' };
    case 'UNATTRIBUTED':
      return { label: 'Unknown account', tone: 'neutral' };
    case 'QUARANTINED':
      return { label: 'Unreadable data', tone: 'warning' };
    default:
      return { label: humanizeAdminLabel(outcome), tone: 'neutral' };
  }
}

type FlagSource = {
  withheldReason?: string | null | undefined;
  entitlementStatus?: string | null | undefined;
};

/** Whether the server sent the consent / plan columns at all (servers before the remediation don't). */
function hasFlagColumns(row: FlagSource): boolean {
  return row.withheldReason !== undefined || row.entitlementStatus !== undefined;
}

/** Plan entitlement recorded when the event arrived. */
export function crashEntitlementStatus(row: FlagSource): DrivingStatus {
  if (row.entitlementStatus === 'ENTITLED') return { label: 'Entitled', tone: 'info' };
  if (row.entitlementStatus === 'NOT_ENTITLED' || row.withheldReason === 'NOT_ENTITLED') {
    return {
      label: 'Not entitled',
      tone: 'warning',
      hint: 'No active paid plan of their own when the event arrived. Safety escalation still applies.',
    };
  }
  return { label: hasFlagColumns(row) ? 'Not recorded' : 'Not reported', tone: 'neutral' };
}

/** Telematics consent recorded when the event arrived. */
export function crashConsentStatus(row: FlagSource): DrivingStatus {
  if (row.withheldReason === 'NO_CONSENT') {
    return {
      label: 'No consent',
      tone: 'warning',
      hint: 'Consent was not granted. Safety escalation still applies; no trip analytics are used.',
    };
  }
  // Consent is checked first, so any other recorded state means consent was granted.
  if (row.withheldReason === 'NOT_ENTITLED' || row.entitlementStatus) {
    return { label: 'Consent granted', tone: 'info' };
  }
  return { label: hasFlagColumns(row) ? 'Not recorded' : 'Not reported', tone: 'neutral' };
}

/** The consent / plan gap chips only (empty when there is none). */
export function crashFlags(row: FlagSource): DrivingStatus[] {
  const flags: DrivingStatus[] = [];
  if (row.withheldReason === 'NO_CONSENT') flags.push(crashConsentStatus(row));
  if (row.entitlementStatus === 'NOT_ENTITLED' || row.withheldReason === 'NOT_ENTITLED') {
    flags.push(crashEntitlementStatus(row));
  }
  return flags;
}

/** How the crash vehicle was chosen. `guess` = not evidence; an operator should confirm it. */
export function vehicleAttributionStatus(
  attribution: string | null | undefined,
): DrivingStatus & { guess: boolean } {
  switch (attribution) {
    case 'TRIP_MATCH':
      return { label: 'Matched to the trip', tone: 'info', guess: false };
    case 'SINGLE_BINDING':
      return { label: 'Only linked vehicle', tone: 'info', guess: false };
    case 'LAST_TRIP':
      return { label: 'Vehicle of the last trip', tone: 'info', guess: false };
    case 'APP_SOS':
      return { label: 'From the app SOS', tone: 'info', guess: false };
    case 'FIRST_BINDING_FALLBACK':
      return { label: 'Best guess — first linked vehicle', tone: 'warning', guess: true };
    case 'ACCOUNT_VEHICLE_FALLBACK':
      return { label: 'Best guess — account vehicle', tone: 'warning', guess: true };
    case null:
    case undefined:
    case '':
      return { label: 'Not attributed', tone: 'neutral', guess: false };
    default:
      return { label: humanizeAdminLabel(attribution), tone: 'neutral', guess: false };
  }
}

export type CrashFilter = 'ALL' | 'NEEDS_REVIEW' | 'CONFIRMED' | 'UNCONFIRMED' | 'FLAGGED';

export const CRASH_FILTER_OPTIONS: { value: CrashFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NEEDS_REVIEW', label: 'Needs review' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'UNCONFIRMED', label: 'Unconfirmed' },
  { value: 'FLAGGED', label: 'Consent / plan gap' },
];

type CrashRow = FlagSource & { state: string };

export function matchesCrashFilter(row: CrashRow, filter: CrashFilter): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'NEEDS_REVIEW':
      return row.state === 'FAILED_TO_PREDICT';
    case 'CONFIRMED':
      return row.state === 'CONFIRMED';
    case 'UNCONFIRMED':
      return row.state === 'UNCONFIRMED';
    case 'FLAGGED':
      return crashFlags(row).length > 0;
  }
}

export function countCrashes(rows: readonly CrashRow[]): {
  total: number;
  needsReview: number;
  confirmed: number;
  flagged: number;
} {
  return {
    total: rows.length,
    needsReview: rows.filter((row) => row.state === 'FAILED_TO_PREDICT').length,
    confirmed: rows.filter((row) => row.state === 'CONFIRMED').length,
    flagged: rows.filter((row) => crashFlags(row).length > 0).length,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Safety alerts (ops alert feed)
 * ---------------------------------------------------------------------------------------------- */

export function safetyAlertKindStatus(kind: string): DrivingStatus {
  switch (kind) {
    case 'FAILED_TO_PREDICT_CRASH':
      return {
        label: 'Crash needs review',
        tone: 'warning',
        hint: 'The detector could not classify a possible crash. It was not escalated.',
      };
    case 'NO_VEHICLE_CONFIRMED_CRASH':
      return {
        label: 'Confirmed crash — no vehicle',
        tone: 'danger',
        hint: 'A confirmed crash could not be escalated because the account has no vehicle.',
      };
    case 'UNPAID_CONFIRMED_CRASH':
      return {
        label: 'Confirmed crash — not entitled',
        tone: 'warning',
        hint: 'Escalated as usual; the account had no active paid plan of its own.',
      };
    case 'VEHICLE_FALLBACK_CRASH':
      return {
        label: 'Vehicle guessed',
        tone: 'warning',
        hint: 'The crash vehicle is a best guess. Confirm it with the user.',
      };
    case 'MALFORMED_CRASH':
      return {
        label: 'Unreadable crash data',
        tone: 'warning',
        hint: 'A crash message for one of our accounts could not be read. It was kept for review.',
      };
    default:
      return { label: humanizeAdminLabel(kind), tone: 'neutral' };
  }
}

/** Reason codes of an alert (`detail`) as short "key: value" strings. Never free text or PII. */
export function safetyAlertDetail(detail: unknown): string[] {
  if (typeof detail !== 'object' || detail === null || Array.isArray(detail)) return [];
  return Object.entries(detail as Record<string, unknown>)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .map(([key, value]) => {
      const label = humanizeAdminLabel(key);
      if (key === 'probability' && typeof value === 'number') {
        return `${label}: ${formatProbability(value)}`;
      }
      if (key === 'attribution' && typeof value === 'string') {
        return `${label}: ${vehicleAttributionStatus(value).label}`;
      }
      if (typeof value === 'boolean') return `${label}: ${value ? 'Yes' : 'No'}`;
      return `${label}: ${typeof value === 'string' ? humanizeAdminLabel(value) : String(value)}`;
    });
}

/* ------------------------------------------------------------------------------------------------
 * Trips + identity
 * ---------------------------------------------------------------------------------------------- */

/** Where a trip came from. PUSH / PULL are server-verified; CLIENT is the phone's own summary. */
export function tripSourceStatus(source: string | undefined, verified: boolean): DrivingStatus {
  if (source === 'CLIENT' || (!source && !verified)) {
    return { label: 'Phone-reported (unverified)', tone: 'warning' };
  }
  if (source === 'PULL') return { label: 'Verified (server sync)', tone: 'info' };
  return { label: 'Verified', tone: 'info' };
}

export type VehicleIdentity = Pick<AdminUserVehicleDto, 'vehicleId' | 'plate' | 'make' | 'model'>;

/** "KA01AB1234 · Maruti Swift" from the account's vehicles; a short id when it is not one of them. */
export function vehicleLabel(
  vehicleId: string | null | undefined,
  vehicles: readonly VehicleIdentity[],
): { primary: string; secondary: string | null; known: boolean } {
  if (!vehicleId) return { primary: 'No vehicle', secondary: null, known: false };
  const vehicle = vehicles.find((row) => row.vehicleId === vehicleId);
  if (!vehicle) {
    return { primary: shortAdminId(vehicleId), secondary: 'Not on this account', known: false };
  }
  const model = [vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return { primary: vehicle.plate, secondary: model || null, known: true };
}
