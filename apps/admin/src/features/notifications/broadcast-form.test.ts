import { describe, expect, it } from 'vitest';

import {
  parseAccountIds,
  parseDeepLinkParams,
  validateBroadcast,
  type BroadcastDraft,
} from './broadcast-form';

const A = 'a0969716-07f9-4519-87fc-f67789b7527d';
const B = '36ad9954-602d-4761-916f-eb09b5223d17';

const DRAFT: BroadcastDraft = {
  audience: 'CONSUMER',
  accountIdsRaw: `${A}\n${B}`,
  title: 'Planned maintenance',
  body: 'The app will be unavailable for 10 minutes tonight.',
  deepLinkScreen: '',
  deepLinkParams: '',
  reason: 'Ops notice for affected users',
};

describe('broadcast form', () => {
  it('splits, de-dupes case-insensitively and rejects non-UUIDs', () => {
    const parsed = parseAccountIds(`${A}, ${A.toUpperCase()};${B}  nope`);
    expect(parsed.ids).toEqual([A, B]);
    expect(parsed.duplicates).toBe(1);
    expect(parsed.invalid).toEqual(['nope']);
  });

  it('builds the wire body; deep link only when a screen is chosen', () => {
    expect(validateBroadcast(DRAFT).body).toEqual({
      audience: 'CONSUMER',
      accountIds: [A, B],
      title: 'Planned maintenance',
      body: 'The app will be unavailable for 10 minutes tonight.',
      reason: 'Ops notice for affected users',
    });
    const withLink = validateBroadcast({
      ...DRAFT,
      deepLinkScreen: 'Plans',
      deepLinkParams: '{"tier":"SECURE"}',
    });
    expect(withLink.body?.deepLink).toEqual({ screen: 'Plans', params: { tier: 'SECURE' } });
  });

  it('enforces the server bounds', () => {
    const { errors, body } = validateBroadcast({
      ...DRAFT,
      accountIdsRaw: '',
      title: 'x'.repeat(81),
      body: '',
      reason: 'no',
      deepLinkScreen: 'Plans',
      deepLinkParams: '[1]',
    });
    expect(body).toBeNull();
    expect(Object.keys(errors).sort()).toEqual([
      'accountIds',
      'body',
      'deepLinkParams',
      'reason',
      'title',
    ]);
  });

  it('caps a broadcast at 500 accounts', () => {
    const ids = Array.from(
      { length: 501 },
      (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    ).join('\n');
    expect(validateBroadcast({ ...DRAFT, accountIdsRaw: ids }).errors.accountIds).toMatch(/500/);
  });

  it('params must be a JSON object', () => {
    expect(parseDeepLinkParams('')).toBeNull();
    expect(parseDeepLinkParams('{"a":1}')).toEqual({ a: 1 });
    expect(typeof parseDeepLinkParams('nope')).toBe('string');
  });
});
