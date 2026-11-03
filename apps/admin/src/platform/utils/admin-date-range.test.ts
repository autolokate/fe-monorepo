import { describe, expect, it } from 'vitest';

import {
  dateInputToExclusiveToIso,
  dateInputToFromIso,
  isDateRangeInverted,
} from './admin-date-range';

describe('admin date range', () => {
  it('maps from to local midnight and to to the next local midnight', () => {
    const from = dateInputToFromIso('2026-11-01');
    const to = dateInputToExclusiveToIso('2026-11-01');
    expect(from).toBe(new Date(2026, 10, 1).toISOString());
    expect(to).toBe(new Date(2026, 10, 2).toISOString());
  });

  it('ignores empty or malformed input', () => {
    expect(dateInputToFromIso('')).toBeUndefined();
    expect(dateInputToExclusiveToIso('11/01/2026')).toBeUndefined();
  });

  it('detects an inverted range', () => {
    expect(isDateRangeInverted('2026-11-05', '2026-11-01')).toBe(true);
    expect(isDateRangeInverted('2026-11-01', '2026-11-01')).toBe(false);
    expect(isDateRangeInverted('', '2026-11-01')).toBe(false);
  });
});
