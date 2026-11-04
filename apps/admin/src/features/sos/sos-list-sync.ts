import type { AdminSosSummary, ListAdminSosIncidentsQuery } from '@autolokate/api-client';

import { mergeSosIncidents, nextSosCursor, sortSosIncidents } from '@/features/sos/sos-model';

/** Live list poll cadence while the page is open and the tab is visible. */
export const SOS_POLL_MS = 5_000;
/** Full re-read cadence — heals anything an incremental `updatedSince` poll could miss. */
export const SOS_RESYNC_MS = 60_000;
export const SOS_PAGE_LIMIT = 100;

export type SosListSnapshot = {
  rows: AdminSosSummary[];
  /** Max `updatedAt` seen — the next `updatedSince`. */
  cursor: string | null;
  /** Epoch ms of the last full read; 0 forces the next poll to be a full read. */
  syncedAt: number;
  /** True when the last full read hit the page limit (older rows exist beyond it). */
  capped: boolean;
};

/**
 * One poll of the live list. First call / every {@link SOS_RESYNC_MS}: a full read (open first, newest
 * first, server-ordered). Otherwise an incremental `updatedSince` read merged into the previous rows.
 * A full incremental page (= limit) forces a full read next time instead of paging.
 */
export async function loadSosSnapshot(
  previous: SosListSnapshot | null,
  nowMs: number,
  fetchPage: (query: ListAdminSosIncidentsQuery) => Promise<AdminSosSummary[]>,
): Promise<SosListSnapshot> {
  if (!previous || previous.cursor === null || nowMs - previous.syncedAt >= SOS_RESYNC_MS) {
    const rows = await fetchPage({ limit: SOS_PAGE_LIMIT });
    return {
      rows: sortSosIncidents(rows),
      cursor: nextSosCursor(null, rows),
      syncedAt: nowMs,
      capped: rows.length >= SOS_PAGE_LIMIT,
    };
  }
  const changed = await fetchPage({
    updatedSince: previous.cursor,
    limit: SOS_PAGE_LIMIT,
  });
  return {
    rows: mergeSosIncidents(previous.rows, changed),
    cursor: nextSosCursor(previous.cursor, changed),
    syncedAt: changed.length >= SOS_PAGE_LIMIT ? 0 : previous.syncedAt,
    capped: previous.capped,
  };
}
