import type { TaxiPolicyDto, UpsertTaxiPolicyDraftBody } from '@autolokate/api-client';

/**
 * Taxi policy form model — every field of `UpsertTaxiPolicyDraftBodyDto`. PUT replaces the whole
 * DRAFT, so the form always sends every field; blank optional inputs are sent as `null`.
 * Ranges mirror the BE class-validator bounds. Advance/deposit accept 0 bps: per money rules v2 a
 * 0 skips that payment entirely (the page warns when a value is 0).
 */
export type TaxiPolicyFormState = {
  customerAdvanceBps: string;
  partnerDepositBps: string;
  customerNoShowWaitMinutes: string;
  customerNoShowMinContactAttempts: string;
  depositReleaseHoursAfterComplete: string;
  disputeSlaBusinessDays: string;
  customerAdvanceRefundWindowHours: string;
  partnerDepositDueMinutes: string;
  tripDisputeWindowHours: string;
  penaltyGt24h: string;
  penaltyH2to24: string;
  penaltyLt2hOrNoShow: string;
  notes: string;
};

export type TaxiPolicyFormField = keyof TaxiPolicyFormState;
export type TaxiPolicyFormErrors = Partial<Record<TaxiPolicyFormField | 'penaltyLadder', string>>;

type NumericFieldSpec = {
  field: Exclude<TaxiPolicyFormField, 'notes'>;
  label: string;
  min: number;
  max: number;
  required: boolean;
};

export const TAXI_POLICY_NUMERIC_FIELDS: NumericFieldSpec[] = [
  { field: 'customerAdvanceBps', label: 'Customer advance', min: 0, max: 10_000, required: true },
  { field: 'partnerDepositBps', label: 'Partner deposit', min: 0, max: 10_000, required: true },
  {
    field: 'customerAdvanceRefundWindowHours',
    label: 'Booking-fee refund window',
    min: 0,
    max: 720,
    required: false,
  },
  {
    field: 'partnerDepositDueMinutes',
    label: 'Partner deposit due',
    min: 1,
    max: 10_080,
    required: false,
  },
  {
    field: 'tripDisputeWindowHours',
    label: 'Trip dispute window',
    min: 0,
    max: 720,
    required: false,
  },
  {
    field: 'customerNoShowWaitMinutes',
    label: 'Customer no-show wait',
    min: 0,
    max: 24 * 60,
    required: false,
  },
  {
    field: 'customerNoShowMinContactAttempts',
    label: 'No-show contact attempts',
    min: 0,
    max: 20,
    required: false,
  },
  {
    field: 'depositReleaseHoursAfterComplete',
    label: 'Deposit release after completion',
    min: 0,
    max: 720,
    required: false,
  },
  {
    field: 'disputeSlaBusinessDays',
    label: 'Dispute SLA',
    min: 0,
    max: 90,
    required: false,
  },
  { field: 'penaltyGt24h', label: 'Penalty > 24 h before', min: 0, max: 10_000, required: false },
  { field: 'penaltyH2to24', label: 'Penalty 2–24 h before', min: 0, max: 10_000, required: false },
  {
    field: 'penaltyLt2hOrNoShow',
    label: 'Penalty < 2 h / no-show',
    min: 0,
    max: 10_000,
    required: false,
  },
];

export const NOTES_MAX = 2000;

function numToInput(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

export function formFromPolicy(policy: TaxiPolicyDto | null): TaxiPolicyFormState {
  const ladder = policy?.partnerCancelPenaltyBpsByStage ?? null;
  return {
    customerAdvanceBps: numToInput(policy?.customerAdvanceBps),
    partnerDepositBps: numToInput(policy?.partnerDepositBps),
    customerNoShowWaitMinutes: numToInput(policy?.customerNoShowWaitMinutes),
    customerNoShowMinContactAttempts: numToInput(policy?.customerNoShowMinContactAttempts),
    depositReleaseHoursAfterComplete: numToInput(policy?.depositReleaseHoursAfterComplete),
    disputeSlaBusinessDays: numToInput(policy?.disputeSlaBusinessDays),
    customerAdvanceRefundWindowHours: numToInput(policy?.customerAdvanceRefundWindowHours),
    partnerDepositDueMinutes: numToInput(policy?.partnerDepositDueMinutes),
    tripDisputeWindowHours: numToInput(policy?.tripDisputeWindowHours),
    penaltyGt24h: numToInput(ladder?.gt24h),
    penaltyH2to24: numToInput(ladder?.h2to24),
    penaltyLt2hOrNoShow: numToInput(ladder?.lt2hOrNoShow),
    notes: policy?.notes ?? '',
  };
}

function parseWhole(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^-?\d+$/.test(trimmed)) return Number.NaN;
  return Number.parseInt(trimmed, 10);
}

export function validateTaxiPolicyForm(form: TaxiPolicyFormState): TaxiPolicyFormErrors {
  const errors: TaxiPolicyFormErrors = {};
  for (const spec of TAXI_POLICY_NUMERIC_FIELDS) {
    const value = parseWhole(form[spec.field]);
    if (value === null) {
      if (spec.required) errors[spec.field] = `${spec.label} is required.`;
      continue;
    }
    if (!Number.isInteger(value)) {
      errors[spec.field] = `${spec.label} must be a whole number.`;
    } else if (value < spec.min || value > spec.max) {
      errors[spec.field] =
        `${spec.label} must be between ${String(spec.min)} and ${String(spec.max)}.`;
    }
  }
  const ladder = [form.penaltyGt24h, form.penaltyH2to24, form.penaltyLt2hOrNoShow].map((v) =>
    v.trim(),
  );
  const filled = ladder.filter((v) => v !== '').length;
  if (filled > 0 && filled < 3) {
    errors.penaltyLadder = 'Fill all three cancel-penalty stages, or leave all three blank.';
  }
  if (form.notes.length > NOTES_MAX) {
    errors.notes = `Notes must be at most ${String(NOTES_MAX)} characters.`;
  }
  return errors;
}

export function hasFormErrors(errors: TaxiPolicyFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function optionalWhole<K extends string>(key: K, raw: string): Partial<Record<K, number>> {
  const value = parseWhole(raw);
  return value === null ? {} : ({ [key]: value } as Record<K, number>);
}

/** Only call after {@link validateTaxiPolicyForm} returned no errors. */
export function bodyFromForm(form: TaxiPolicyFormState): UpsertTaxiPolicyDraftBody {
  const num = (raw: string) => parseWhole(raw);
  const gt24h = num(form.penaltyGt24h);
  const h2to24 = num(form.penaltyH2to24);
  const lt2hOrNoShow = num(form.penaltyLt2hOrNoShow);
  const notes = form.notes.trim();
  return {
    customerAdvanceBps: num(form.customerAdvanceBps) ?? 0,
    partnerDepositBps: num(form.partnerDepositBps) ?? 0,
    customerNoShowWaitMinutes: num(form.customerNoShowWaitMinutes),
    customerNoShowMinContactAttempts: num(form.customerNoShowMinContactAttempts),
    depositReleaseHoursAfterComplete: num(form.depositReleaseHoursAfterComplete),
    disputeSlaBusinessDays: num(form.disputeSlaBusinessDays),
    // Windows: blank → omitted, so the SERVER applies its own documented default (never a FE guess).
    ...optionalWhole('customerAdvanceRefundWindowHours', form.customerAdvanceRefundWindowHours),
    ...optionalWhole('partnerDepositDueMinutes', form.partnerDepositDueMinutes),
    ...optionalWhole('tripDisputeWindowHours', form.tripDisputeWindowHours),
    partnerCancelPenaltyBpsByStage:
      gt24h !== null && h2to24 !== null && lt2hOrNoShow !== null
        ? { gt24h, h2to24, lt2hOrNoShow }
        : null,
    notes: notes === '' ? null : notes,
  };
}

export function formsEqual(a: TaxiPolicyFormState, b: TaxiPolicyFormState): boolean {
  return (Object.keys(a) as TaxiPolicyFormField[]).every((key) => a[key].trim() === b[key].trim());
}

export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

/** One comparable row used by the side-by-side view and the publish diff. */
export type TaxiPolicyDisplayRow = {
  key: string;
  label: string;
  format: (policy: TaxiPolicyDto | null) => string;
};

function fmtBps(value: number | null | undefined): string {
  return typeof value === 'number' ? `${String(value)} bps · ${bpsToPercent(value)}` : 'Not set';
}

function fmtUnit(value: number | null | undefined, unit: string): string {
  return typeof value === 'number' ? `${String(value)} ${unit}` : 'Not set';
}

export const TAXI_POLICY_DISPLAY_ROWS: TaxiPolicyDisplayRow[] = [
  {
    key: 'customerAdvanceBps',
    label: 'Customer advance',
    format: (p) => fmtBps(p?.customerAdvanceBps),
  },
  {
    key: 'partnerDepositBps',
    label: 'Partner deposit',
    format: (p) => fmtBps(p?.partnerDepositBps),
  },
  {
    key: 'customerAdvanceRefundWindowHours',
    label: 'Booking-fee refund window',
    format: (p) => fmtUnit(p?.customerAdvanceRefundWindowHours, 'h after payment'),
  },
  {
    key: 'partnerDepositDueMinutes',
    label: 'Partner deposit due',
    format: (p) => fmtUnit(p?.partnerDepositDueMinutes, 'min after booking fee'),
  },
  {
    key: 'tripDisputeWindowHours',
    label: 'Trip dispute window',
    format: (p) => fmtUnit(p?.tripDisputeWindowHours, 'h after pickup'),
  },
  {
    key: 'customerNoShowWaitMinutes',
    label: 'No-show wait',
    format: (p) => fmtUnit(p?.customerNoShowWaitMinutes, 'min'),
  },
  {
    key: 'customerNoShowMinContactAttempts',
    label: 'No-show contact attempts',
    format: (p) => fmtUnit(p?.customerNoShowMinContactAttempts, 'attempts'),
  },
  {
    key: 'depositReleaseHoursAfterComplete',
    label: 'Settlement window after completion',
    format: (p) => fmtUnit(p?.depositReleaseHoursAfterComplete, 'h'),
  },
  {
    key: 'disputeSlaBusinessDays',
    label: 'Dispute SLA',
    format: (p) => fmtUnit(p?.disputeSlaBusinessDays, 'business days'),
  },
  {
    key: 'penaltyGt24h',
    label: 'Partner cancel penalty > 24 h',
    format: (p) => fmtBps(p?.partnerCancelPenaltyBpsByStage?.gt24h),
  },
  {
    key: 'penaltyH2to24',
    label: 'Partner cancel penalty 2–24 h',
    format: (p) => fmtBps(p?.partnerCancelPenaltyBpsByStage?.h2to24),
  },
  {
    key: 'penaltyLt2hOrNoShow',
    label: 'Partner cancel penalty < 2 h / no-show',
    format: (p) => fmtBps(p?.partnerCancelPenaltyBpsByStage?.lt2hOrNoShow),
  },
  {
    key: 'notes',
    label: 'Notes',
    format: (p) => (p?.notes && p.notes.trim() !== '' ? p.notes : 'None'),
  },
];

export function diffPolicies(
  live: TaxiPolicyDto | null,
  draft: TaxiPolicyDto | null,
): Array<{ key: string; label: string; before: string; after: string }> {
  return TAXI_POLICY_DISPLAY_ROWS.map((row) => ({
    key: row.key,
    label: row.label,
    before: row.format(live),
    after: row.format(draft),
  })).filter((row) => row.before !== row.after);
}
