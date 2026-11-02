import {
  GARAGE_FREE_BIDS_PER_WEEK_MAX,
  GARAGE_MONTH_PASS_DURATION_DAYS_MAX,
  GARAGE_MONTH_PASS_DURATION_DAYS_MIN,
  type GarageCommercialConfigDto,
  type GarageMonthPassDurationKind,
  type UpdateGarageCommercialConfigBody,
} from '@autolokate/api-client';

/** Default ROLLING_DAYS window when the server has not stored one yet (BE preview default). */
export const DEFAULT_MONTH_PASS_DURATION_DAYS = 30;

/**
 * Editable commercial-config fields. Numeric inputs are kept as raw strings so an empty or
 * fractional value is reported as a validation error instead of silently becoming 0.
 */
export type GarageCommercialFormState = {
  freeBidLifetimeCount: string;
  freeBidsPerWeek: string;
  dayPassPriceRupees: string;
  monthPassPriceRupees: string;
  dayPassDurationHours: string;
  monthPassDurationKind: GarageMonthPassDurationKind;
  monthPassDurationDays: string;
  gstRateBps: string;
};

export type GarageCommercialFormField = keyof GarageCommercialFormState;

export type GarageCommercialFormErrors = Partial<Record<GarageCommercialFormField, string>>;

/**
 * Flow v3 servers return `freeBidsPerWeek` + `monthPassDurationDays`. Older servers omit them and
 * only accept `CALENDAR_MONTH_IST`, so the page keeps the legacy (lifetime) controls for them.
 */
export function supportsFlowV3Garage(config: GarageCommercialConfigDto | null): boolean {
  return typeof config?.freeBidsPerWeek === 'number';
}

export function configToForm(config: GarageCommercialConfigDto): GarageCommercialFormState {
  return {
    freeBidLifetimeCount: String(config.freeBidLifetimeCount),
    freeBidsPerWeek: String(config.freeBidsPerWeek ?? ''),
    dayPassPriceRupees: String(config.dayPassPriceRupees),
    monthPassPriceRupees: String(config.monthPassPriceRupees),
    dayPassDurationHours: String(config.dayPassDurationHours),
    monthPassDurationKind: config.monthPassDurationKind,
    monthPassDurationDays: String(config.monthPassDurationDays ?? DEFAULT_MONTH_PASS_DURATION_DAYS),
    gstRateBps: String(config.gstRateBps),
  };
}

function parseIntInRange(
  raw: string,
  min: number,
  max: number,
): { ok: true; value: number } | { ok: false } {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value < min || value > max) return { ok: false };
  return { ok: true, value };
}

type FieldRule = { field: GarageCommercialFormField; min: number; max: number; label: string };

/** Mirrors `GARAGE_CONFIG_LIMITS` on the server so the operator sees errors before saving. */
const BASE_RULES: FieldRule[] = [
  { field: 'dayPassPriceRupees', min: 0, max: 100_000, label: 'Day pass price' },
  { field: 'dayPassDurationHours', min: 1, max: 168, label: 'Day pass duration' },
  { field: 'monthPassPriceRupees', min: 0, max: 500_000, label: 'Month pass price' },
  { field: 'gstRateBps', min: 0, max: 10_000, label: 'GST rate' },
];

const LEGACY_RULES: FieldRule[] = [
  { field: 'freeBidLifetimeCount', min: 0, max: 100, label: 'Lifetime free bids' },
];

const V3_RULES: FieldRule[] = [
  {
    field: 'freeBidsPerWeek',
    min: 0,
    max: GARAGE_FREE_BIDS_PER_WEEK_MAX,
    label: 'Free bids per week',
  },
];

const ROLLING_DAYS_RULE: FieldRule = {
  field: 'monthPassDurationDays',
  min: GARAGE_MONTH_PASS_DURATION_DAYS_MIN,
  max: GARAGE_MONTH_PASS_DURATION_DAYS_MAX,
  label: 'Month pass duration',
};

export function validateGarageCommercialForm(
  form: GarageCommercialFormState,
  options: { flowV3: boolean },
): GarageCommercialFormErrors {
  const rules = [...BASE_RULES, ...(options.flowV3 ? V3_RULES : LEGACY_RULES)];
  if (options.flowV3 && form.monthPassDurationKind === 'ROLLING_DAYS') {
    rules.push(ROLLING_DAYS_RULE);
  }
  const errors: GarageCommercialFormErrors = {};
  for (const rule of rules) {
    if (!parseIntInRange(form[rule.field], rule.min, rule.max).ok) {
      errors[rule.field] =
        `${rule.label} must be a whole number from ${rule.min.toLocaleString('en-IN')} to ${rule.max.toLocaleString('en-IN')}.`;
    }
  }
  if (!options.flowV3 && form.monthPassDurationKind !== 'CALENDAR_MONTH_IST') {
    errors.monthPassDurationKind = 'This server only supports a calendar-month (IST) pass.';
  }
  return errors;
}

function toInt(raw: string): number {
  return Number(raw.trim());
}

/**
 * Build the PUT body. Legacy audit fields are echoed from the loaded config. On flow v3 the
 * weekly allowance + month-pass window are sent; for CALENDAR_MONTH_IST the stored day count is
 * echoed unchanged (the server validates it for both kinds).
 */
export function toUpdateGarageCommercialConfigBody(
  config: GarageCommercialConfigDto,
  form: GarageCommercialFormState,
  options: { flowV3: boolean },
): UpdateGarageCommercialConfigBody {
  const body: UpdateGarageCommercialConfigBody = {
    welcomeCredits: config.welcomeCredits,
    creditsPerFirstBid: config.creditsPerFirstBid,
    freeBidLifetimeCount: options.flowV3
      ? config.freeBidLifetimeCount
      : toInt(form.freeBidLifetimeCount),
    dayPassPriceRupees: toInt(form.dayPassPriceRupees),
    monthPassPriceRupees: toInt(form.monthPassPriceRupees),
    dayPassDurationHours: toInt(form.dayPassDurationHours),
    monthPassDurationKind: options.flowV3 ? form.monthPassDurationKind : 'CALENDAR_MONTH_IST',
    gstRateBps: toInt(form.gstRateBps),
  };
  if (options.flowV3) {
    body.freeBidsPerWeek = toInt(form.freeBidsPerWeek);
    body.monthPassDurationDays =
      form.monthPassDurationKind === 'ROLLING_DAYS'
        ? toInt(form.monthPassDurationDays)
        : (config.monthPassDurationDays ?? DEFAULT_MONTH_PASS_DURATION_DAYS);
  }
  return body;
}

export function monthPassDurationLabel(kind: string | undefined, days: number | undefined): string {
  if (kind === 'ROLLING_DAYS') {
    const n = days ?? DEFAULT_MONTH_PASS_DURATION_DAYS;
    return `${String(n)} ${n === 1 ? 'day' : 'days'} from purchase`;
  }
  return 'Calendar month (IST)';
}

const IST_OFFSET_MS = 330 * 60_000;
const DAY_MS = 86_400_000;

/**
 * Next Monday 00:00 Asia/Kolkata after `now` — when garage weekly free bids reset. IST has no DST,
 * so a fixed +05:30 shift matches the server's `istWeekOf`.
 */
export function nextIstWeeklyReset(now: Date): Date {
  const shifted = now.getTime() + IST_OFFSET_MS;
  const istMidnight = Math.floor(shifted / DAY_MS) * DAY_MS;
  const weekday = new Date(istMidnight).getUTCDay();
  const mondayShifted = istMidnight - ((weekday + 6) % 7) * DAY_MS;
  return new Date(mondayShifted + 7 * DAY_MS - IST_OFFSET_MS);
}

export function formatIstDateTime(value: Date): string {
  return `${value.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} IST`;
}
