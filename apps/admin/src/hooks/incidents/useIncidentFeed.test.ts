import type { AdminIncidentFeedItem } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { mergeIncidentFeed } from '@/hooks/incidents/useIncidentFeed';

function row(id: string, updatedAt: string, status: 'OPEN' | 'RESOLVED' = 'OPEN') {
  return {
    incidentId: id,
    source: 'BYSTANDER',
    status,
    dispatchPath: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt,
  } satisfies AdminIncidentFeedItem;
}

describe('mergeIncidentFeed', () => {
  it('replaces an incident with its newer update and sorts newest first', () => {
    const merged = mergeIncidentFeed(
      [row('a', '2026-11-01T01:00:00.000Z'), row('b', '2026-11-01T02:00:00.000Z')],
      [row('a', '2026-11-01T03:00:00.000Z', 'RESOLVED')],
    );
    expect(merged.map((r) => r.incidentId)).toEqual(['a', 'b']);
    expect(merged[0]?.status).toBe('RESOLVED');
  });

  it('ignores a stale update', () => {
    const merged = mergeIncidentFeed(
      [row('a', '2026-11-01T03:00:00.000Z', 'RESOLVED')],
      [row('a', '2026-11-01T01:00:00.000Z')],
    );
    expect(merged[0]?.status).toBe('RESOLVED');
  });
});
