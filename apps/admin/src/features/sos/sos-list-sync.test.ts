import type { ListAdminSosIncidentsQuery } from '@autolokate/api-client';
import { describe, expect, it, vi } from 'vitest';

import { loadSosSnapshot, SOS_PAGE_LIMIT, SOS_RESYNC_MS } from '@/features/sos/sos-list-sync';
import { sosRow } from '@/features/sos/sos-test-fixtures';

describe('loadSosSnapshot', () => {
  const t0 = 1_000_000;

  it('does a full read first, then incremental updatedSince reads merged in', async () => {
    const fetchPage = vi
      .fn<(q: ListAdminSosIncidentsQuery) => Promise<ReturnType<typeof sosRow>[]>>()
      .mockResolvedValueOnce([sosRow({ incidentId: 'a', updatedAt: '2026-11-05T10:00:05Z' })])
      .mockResolvedValueOnce([
        sosRow({
          incidentId: 'b',
          state: 'AUTO_ACTIVATED',
          urgent: true,
          updatedAt: '2026-11-05T10:00:09Z',
        }),
      ]);

    const first = await loadSosSnapshot(null, t0, fetchPage);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { limit: SOS_PAGE_LIMIT });
    expect(first.cursor).toBe('2026-11-05T10:00:05Z');

    const second = await loadSosSnapshot(first, t0 + 5_000, fetchPage);
    expect(fetchPage).toHaveBeenNthCalledWith(2, {
      updatedSince: '2026-11-05T10:00:05Z',
      limit: SOS_PAGE_LIMIT,
    });
    expect(second.rows.map((r) => r.incidentId)).toEqual(['b', 'a']);
    expect(second.cursor).toBe('2026-11-05T10:00:09Z');
    expect(second.syncedAt).toBe(t0);
  });

  it('re-reads everything after the resync window or a full incremental page', async () => {
    const prev = {
      rows: [sosRow()],
      cursor: '2026-11-05T10:00:00Z',
      syncedAt: t0,
      capped: false,
    };
    const fetchPage = vi.fn().mockResolvedValue([]);
    await loadSosSnapshot(prev, t0 + SOS_RESYNC_MS, fetchPage);
    expect(fetchPage).toHaveBeenLastCalledWith({ limit: SOS_PAGE_LIMIT });

    const full = Array.from({ length: SOS_PAGE_LIMIT }, (_, i) =>
      sosRow({ incidentId: `x${String(i)}`, updatedAt: '2026-11-05T10:00:01Z' }),
    );
    const next = await loadSosSnapshot(prev, t0 + 1_000, vi.fn().mockResolvedValue(full));
    expect(next.syncedAt).toBe(0);
  });
});
