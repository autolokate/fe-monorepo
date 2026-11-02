import { describe, expect, it } from 'vitest';

import {
  readUrlFilterValue,
  readUrlFlag,
  writeUrlFilterValue,
  writeUrlFlag,
} from '@/platform/state/url-filter-state';

describe('url filter state', () => {
  it('reads a valid enum value and falls back for missing ones', () => {
    expect(readUrlFilterValue(new URLSearchParams('status=DISPUTED'), 'status', 'ALL')).toBe(
      'DISPUTED',
    );
    expect(readUrlFilterValue(new URLSearchParams(''), 'status', 'ALL')).toBe('ALL');
  });

  it('rejects values outside the allow-list', () => {
    const allowed = ['ALL', 'OPEN'] as const;
    expect(readUrlFilterValue(new URLSearchParams('status=CLOSED'), 'status', 'ALL', allowed)).toBe(
      'ALL',
    );
    expect(readUrlFilterValue(new URLSearchParams('status=OPEN'), 'status', 'ALL', allowed)).toBe(
      'OPEN',
    );
  });

  it('rejects malformed values when there is no allow-list', () => {
    for (const raw of ['a b', '<script>', '1ABC', 'x'.repeat(60), 'A-B']) {
      const params = new URLSearchParams();
      params.set('status', raw);
      expect(readUrlFilterValue(params, 'status', 'ALL')).toBe('ALL');
    }
    expect(readUrlFilterValue(new URLSearchParams('sort=sort_order'), 'sort', 'updated')).toBe(
      'sort_order',
    );
  });

  it('drops the default value from the URL and keeps other params', () => {
    const base = new URLSearchParams('status=OPEN&page=2');
    expect(writeUrlFilterValue(base, 'status', 'ALL', 'ALL').toString()).toBe('page=2');
    expect(writeUrlFilterValue(base, 'status', 'CLOSED', 'ALL').toString()).toBe(
      'status=CLOSED&page=2',
    );
    // Never mutates the input.
    expect(base.toString()).toBe('status=OPEN&page=2');
  });

  it('round-trips boolean flags', () => {
    const on = writeUrlFlag(new URLSearchParams(), 'flagged', true);
    expect(on.toString()).toBe('flagged=1');
    expect(readUrlFlag(on, 'flagged')).toBe(true);
    expect(readUrlFlag(writeUrlFlag(on, 'flagged', false), 'flagged')).toBe(false);
    expect(readUrlFlag(new URLSearchParams('flagged=true'), 'flagged')).toBe(true);
  });
});
