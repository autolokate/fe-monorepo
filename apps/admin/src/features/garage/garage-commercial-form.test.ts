import type { GarageCommercialConfigDto } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import {
  configToForm,
  monthPassDurationLabel,
  nextIstWeeklyReset,
  supportsFlowV3Garage,
  toUpdateGarageCommercialConfigBody,
  validateGarageCommercialForm,
} from './garage-commercial-form';

const legacyConfig: GarageCommercialConfigDto = {
  id: 'cfg',
  welcomeCredits: 20,
  creditsPerFirstBid: 10,
  freeBidLifetimeCount: 2,
  dayPassPriceRupees: 100,
  monthPassPriceRupees: 1800,
  dayPassDurationHours: 24,
  monthPassDurationKind: 'CALENDAR_MONTH_IST',
  gstRateBps: 1800,
  updatedAt: '2026-11-01T00:00:00.000Z',
};

const v3Config: GarageCommercialConfigDto = {
  ...legacyConfig,
  freeBidsPerWeek: 2,
  monthPassDurationDays: 30,
};

describe('supportsFlowV3Garage', () => {
  it('detects v3 by freeBidsPerWeek presence', () => {
    expect(supportsFlowV3Garage(v3Config)).toBe(true);
    expect(supportsFlowV3Garage(legacyConfig)).toBe(false);
    expect(supportsFlowV3Garage(null)).toBe(false);
  });
});

describe('validateGarageCommercialForm', () => {
  it('accepts the loaded v3 config', () => {
    expect(validateGarageCommercialForm(configToForm(v3Config), { flowV3: true })).toEqual({});
  });

  it('bounds freeBidsPerWeek to 0-100 whole numbers', () => {
    const base = configToForm(v3Config);
    expect(
      validateGarageCommercialForm({ ...base, freeBidsPerWeek: '0' }, { flowV3: true }),
    ).toEqual({});
    expect(
      validateGarageCommercialForm({ ...base, freeBidsPerWeek: '100' }, { flowV3: true }),
    ).toEqual({});
    for (const bad of ['101', '-1', '1.5', '', 'abc']) {
      expect(
        validateGarageCommercialForm({ ...base, freeBidsPerWeek: bad }, { flowV3: true })
          .freeBidsPerWeek,
      ).toMatch(/0 to 100/);
    }
  });

  it('only validates monthPassDurationDays for ROLLING_DAYS', () => {
    const base = configToForm(v3Config);
    expect(
      validateGarageCommercialForm({ ...base, monthPassDurationDays: '0' }, { flowV3: true }),
    ).toEqual({});
    const rolling = { ...base, monthPassDurationKind: 'ROLLING_DAYS' as const };
    expect(
      validateGarageCommercialForm({ ...rolling, monthPassDurationDays: '0' }, { flowV3: true })
        .monthPassDurationDays,
    ).toMatch(/1 to 366/);
    expect(
      validateGarageCommercialForm({ ...rolling, monthPassDurationDays: '367' }, { flowV3: true })
        .monthPassDurationDays,
    ).toBeDefined();
    expect(
      validateGarageCommercialForm({ ...rolling, monthPassDurationDays: '366' }, { flowV3: true }),
    ).toEqual({});
  });

  it('rejects ROLLING_DAYS against a pre-v3 server', () => {
    const form = { ...configToForm(legacyConfig), monthPassDurationKind: 'ROLLING_DAYS' as const };
    expect(
      validateGarageCommercialForm(form, { flowV3: false }).monthPassDurationKind,
    ).toBeDefined();
  });

  it('validates the existing pricing fields', () => {
    const base = configToForm(v3Config);
    expect(
      validateGarageCommercialForm({ ...base, dayPassDurationHours: '0' }, { flowV3: true })
        .dayPassDurationHours,
    ).toBeDefined();
    expect(
      validateGarageCommercialForm({ ...base, dayPassPriceRupees: '' }, { flowV3: true })
        .dayPassPriceRupees,
    ).toBeDefined();
  });
});

describe('toUpdateGarageCommercialConfigBody', () => {
  it('sends v3 fields and echoes the stored day count for calendar months', () => {
    const form = { ...configToForm(v3Config), freeBidsPerWeek: '5' };
    expect(toUpdateGarageCommercialConfigBody(v3Config, form, { flowV3: true })).toEqual({
      welcomeCredits: 20,
      creditsPerFirstBid: 10,
      freeBidLifetimeCount: 2,
      dayPassPriceRupees: 100,
      monthPassPriceRupees: 1800,
      dayPassDurationHours: 24,
      monthPassDurationKind: 'CALENDAR_MONTH_IST',
      gstRateBps: 1800,
      freeBidsPerWeek: 5,
      monthPassDurationDays: 30,
    });
  });

  it('sends the edited day count for ROLLING_DAYS', () => {
    const form = {
      ...configToForm(v3Config),
      monthPassDurationKind: 'ROLLING_DAYS' as const,
      monthPassDurationDays: '45',
    };
    expect(toUpdateGarageCommercialConfigBody(v3Config, form, { flowV3: true })).toMatchObject({
      monthPassDurationKind: 'ROLLING_DAYS',
      monthPassDurationDays: 45,
    });
  });

  it('omits v3 fields for a pre-v3 server', () => {
    const body = toUpdateGarageCommercialConfigBody(legacyConfig, configToForm(legacyConfig), {
      flowV3: false,
    });
    expect(body).not.toHaveProperty('freeBidsPerWeek');
    expect(body).not.toHaveProperty('monthPassDurationDays');
    expect(body.monthPassDurationKind).toBe('CALENDAR_MONTH_IST');
  });
});

describe('nextIstWeeklyReset', () => {
  it('returns the next Monday 00:00 IST', () => {
    // Wed 4 Nov 2026 10:00 IST -> Mon 9 Nov 2026 00:00 IST (= Sun 8 Nov 18:30 UTC).
    expect(nextIstWeeklyReset(new Date('2026-11-04T04:30:00.000Z')).toISOString()).toBe(
      '2026-11-08T18:30:00.000Z',
    );
  });

  it('rolls a full week at exactly Monday 00:00 IST', () => {
    expect(nextIstWeeklyReset(new Date('2026-11-08T18:30:00.000Z')).toISOString()).toBe(
      '2026-11-15T18:30:00.000Z',
    );
  });

  it('treats Sunday late evening UTC as already Monday in IST', () => {
    // Sun 8 Nov 19:00 UTC = Mon 9 Nov 00:30 IST -> next reset Mon 16 Nov 00:00 IST.
    expect(nextIstWeeklyReset(new Date('2026-11-08T19:00:00.000Z')).toISOString()).toBe(
      '2026-11-15T18:30:00.000Z',
    );
  });
});

describe('monthPassDurationLabel', () => {
  it('labels both kinds', () => {
    expect(monthPassDurationLabel('CALENDAR_MONTH_IST', 30)).toBe('Calendar month (IST)');
    expect(monthPassDurationLabel('ROLLING_DAYS', 45)).toBe('45 days from purchase');
    expect(monthPassDurationLabel('ROLLING_DAYS', 1)).toBe('1 day from purchase');
  });
});
