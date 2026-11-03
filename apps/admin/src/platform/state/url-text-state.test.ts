import { describe, expect, it } from 'vitest';

import { readUrlTextValue, URL_TEXT_FILTER_MAX, writeUrlTextValue } from './useUrlTextState';

describe('url text filter state', () => {
  it('round-trips ids, dates and names with spaces', () => {
    let params = new URLSearchParams('status=OPEN');
    params = writeUrlTextValue(params, 'org', 'aaaaaaaa-0000-4000-8000-0000000000aa');
    params = writeUrlTextValue(params, 'from', '2026-11-01');
    params = writeUrlTextValue(params, 'city', 'New Delhi');
    expect(readUrlTextValue(params, 'org')).toBe('aaaaaaaa-0000-4000-8000-0000000000aa');
    expect(readUrlTextValue(params, 'from')).toBe('2026-11-01');
    expect(readUrlTextValue(params, 'city')).toBe('New Delhi');
    expect(params.get('status')).toBe('OPEN');
  });

  it('drops blank values and caps length', () => {
    let params = writeUrlTextValue(new URLSearchParams('org=x'), 'org', '   ');
    expect(params.has('org')).toBe(false);
    params = writeUrlTextValue(params, 'q', 'x'.repeat(500));
    expect(readUrlTextValue(params, 'q')).toHaveLength(URL_TEXT_FILTER_MAX);
  });
});
