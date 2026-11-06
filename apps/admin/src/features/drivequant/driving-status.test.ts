import { describe, expect, it } from 'vitest';

import {
  countCrashes,
  crashConsentStatus,
  crashEntitlementStatus,
  crashFlags,
  crashOutcomeStatus,
  crashStateStatus,
  formatIst,
  formatIstTime,
  formatKm,
  formatKmh,
  formatMinutes,
  formatProbability,
  formatScore,
  istDayStartIso,
  matchesCrashFilter,
  safetyAlertDetail,
  safetyAlertKindStatus,
  tripSourceStatus,
  vehicleAttributionStatus,
  vehicleLabel,
} from './driving-status';

describe('crash state mapping', () => {
  it.each([
    ['CONFIRMED', 'Confirmed crash', 'danger'],
    ['UNCONFIRMED', 'Unconfirmed', 'neutral'],
    ['FAILED_TO_PREDICT', 'Needs review', 'warning'],
    ['SOMETHING_NEW', 'Something New', 'neutral'],
  ])('%s → %s', (state, label, tone) => {
    expect(crashStateStatus(state)).toMatchObject({ label, tone });
  });

  it.each([
    ['DISPATCHED', 'CONFIRMED', 'Escalated to SOS'],
    ['UNCONFIRMED', 'UNCONFIRMED', 'Not escalated'],
    ['UNCONFIRMED', 'FAILED_TO_PREDICT', 'Not escalated — review'],
    ['NO_VEHICLE', 'CONFIRMED', 'Not escalated — no vehicle'],
    ['NOT_ENTITLED', 'CONFIRMED', 'Not escalated — not entitled'],
    ['CANCELLED', 'CONFIRMED', 'Cancelled by user'],
    ['UNATTRIBUTED', 'CONFIRMED', 'Unknown account'],
    ['QUARANTINED', 'CONFIRMED', 'Unreadable data'],
  ])('outcome %s (%s) → %s', (outcome, state, label) => {
    expect(crashOutcomeStatus(outcome, state).label).toBe(label);
  });
});

describe('consent / entitlement flags', () => {
  it('NO_CONSENT on an unpaid account flags both gaps', () => {
    const row = { withheldReason: 'NO_CONSENT', entitlementStatus: 'NOT_ENTITLED' };
    expect(crashConsentStatus(row).label).toBe('No consent');
    expect(crashEntitlementStatus(row).label).toBe('Not entitled');
    expect(crashFlags(row).map((flag) => flag.label)).toEqual(['No consent', 'Not entitled']);
  });

  it('NOT_ENTITLED implies consent was granted', () => {
    const row = { withheldReason: 'NOT_ENTITLED', entitlementStatus: 'NOT_ENTITLED' };
    expect(crashConsentStatus(row).label).toBe('Consent granted');
    expect(crashFlags(row).map((flag) => flag.label)).toEqual(['Not entitled']);
  });

  it('entitled + consented → no flags', () => {
    const row = { withheldReason: null, entitlementStatus: 'ENTITLED' };
    expect(crashEntitlementStatus(row).label).toBe('Entitled');
    expect(crashConsentStatus(row).label).toBe('Consent granted');
    expect(crashFlags(row)).toEqual([]);
  });

  it('older rows / servers: "Not recorded" vs "Not reported", never a guess', () => {
    expect(crashConsentStatus({ withheldReason: null, entitlementStatus: null }).label).toBe(
      'Not recorded',
    );
    expect(crashEntitlementStatus({}).label).toBe('Not reported');
    expect(crashConsentStatus({}).label).toBe('Not reported');
  });
});

describe('filtering + counts', () => {
  const rows = [
    { state: 'CONFIRMED', withheldReason: null, entitlementStatus: 'ENTITLED' },
    { state: 'FAILED_TO_PREDICT', withheldReason: null, entitlementStatus: 'ENTITLED' },
    { state: 'CONFIRMED', withheldReason: 'NO_CONSENT', entitlementStatus: 'ENTITLED' },
    { state: 'UNCONFIRMED', withheldReason: null, entitlementStatus: null },
  ];

  it('filters by state and by consent / plan gap', () => {
    expect(rows.filter((row) => matchesCrashFilter(row, 'ALL'))).toHaveLength(4);
    expect(rows.filter((row) => matchesCrashFilter(row, 'NEEDS_REVIEW'))).toHaveLength(1);
    expect(rows.filter((row) => matchesCrashFilter(row, 'CONFIRMED'))).toHaveLength(2);
    expect(rows.filter((row) => matchesCrashFilter(row, 'UNCONFIRMED'))).toHaveLength(1);
    expect(rows.filter((row) => matchesCrashFilter(row, 'FLAGGED'))).toHaveLength(1);
  });

  it('counts', () => {
    expect(countCrashes(rows)).toEqual({ total: 4, needsReview: 1, confirmed: 2, flagged: 1 });
  });
});

describe('vehicle attribution + identity', () => {
  it('flags guessed vehicles', () => {
    expect(vehicleAttributionStatus('TRIP_MATCH')).toMatchObject({ guess: false });
    expect(vehicleAttributionStatus('FIRST_BINDING_FALLBACK')).toMatchObject({
      guess: true,
      tone: 'warning',
    });
    expect(vehicleAttributionStatus('ACCOUNT_VEHICLE_FALLBACK').guess).toBe(true);
    expect(vehicleAttributionStatus(null).label).toBe('Not attributed');
  });

  it('resolves the plate from the account vehicles; unknown ids stay ids', () => {
    const vehicles = [{ vehicleId: 'v-1', plate: 'KA01AB1234', make: 'Maruti', model: 'Swift' }];
    expect(vehicleLabel('v-1', vehicles)).toEqual({
      primary: 'KA01AB1234',
      secondary: 'Maruti Swift',
      known: true,
    });
    expect(vehicleLabel('0f0e0d0c-aaaa-bbbb-cccc-000000000000', vehicles)).toMatchObject({
      known: false,
      secondary: 'Not on this account',
    });
    expect(vehicleLabel(null, vehicles).primary).toBe('No vehicle');
  });
});

describe('safety alerts', () => {
  it.each([
    ['FAILED_TO_PREDICT_CRASH', 'Crash needs review'],
    ['NO_VEHICLE_CONFIRMED_CRASH', 'Confirmed crash — no vehicle'],
    ['UNPAID_CONFIRMED_CRASH', 'Confirmed crash — not entitled'],
    ['VEHICLE_FALLBACK_CRASH', 'Vehicle guessed'],
    ['MALFORMED_CRASH', 'Unreadable crash data'],
  ])('%s → %s', (kind, label) => {
    expect(safetyAlertKindStatus(kind).label).toBe(label);
  });

  it('renders reason codes only', () => {
    expect(
      safetyAlertDetail({
        probability: 42,
        attribution: 'FIRST_BINDING_FALLBACK',
        escalated: true,
        nested: { a: 1 },
      }),
    ).toEqual([
      'Probability: 42%',
      'Attribution: Best guess — first linked vehicle',
      'Escalated: Yes',
    ]);
    expect(safetyAlertDetail(null)).toEqual([]);
  });
});

describe('formatting', () => {
  it('shows IST regardless of the browser zone', () => {
    // 11:56 UTC = 17:26 IST.
    expect(formatIst('2026-11-06T11:56:00.000Z')).toMatch(/06 Nov 2026.*05:26.*pm IST$/i);
    expect(formatIstTime('2026-11-06T11:56:07.000Z')).toMatch(/05:26:07.*pm IST$/i);
    expect(formatIst(null)).toBe('—');
    expect(formatIst('not-a-date')).toBe('—');
  });

  it('IST day bounds for the trip date filter', () => {
    expect(istDayStartIso('2026-11-06')).toBe('2026-11-05T18:30:00.000Z');
    expect(istDayStartIso('2026-11-06', 1)).toBe('2026-11-06T18:30:00.000Z');
  });

  it('durations, distances, speeds, scores, probability', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(65)).toBe('1 h 05 min');
    expect(formatMinutes(null)).toBe('—');
    expect(formatKm(18.44)).toBe('18.4 km');
    expect(formatKmh(22.94)).toBe('23 km/h');
    expect(formatScore(7.25)).toBe('7.3');
    expect(formatScore(11)).toBe('Not scored');
    expect(formatProbability(78)).toBe('78%');
    expect(formatProbability(1)).toBe('1%');
  });

  it('trip source', () => {
    expect(tripSourceStatus('PUSH', true).label).toBe('Verified');
    expect(tripSourceStatus('PULL', true).label).toBe('Verified (server sync)');
    expect(tripSourceStatus('CLIENT', false).label).toBe('Phone-reported (unverified)');
  });
});
