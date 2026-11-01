import type { AdminIncidentFeedItem } from '@autolokate/api-client';
import { useEffect, useRef, useState } from 'react';

import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchIncidentsFeed } from '@/services/incidents/incidents-service';

export const INCIDENT_FEED_POLL_MS = 15_000;
const MAX_ROWS = 200;

/** Merge a feed page into the current rows: newer `updatedAt` wins, newest first, capped. */
export function mergeIncidentFeed(
  current: readonly AdminIncidentFeedItem[],
  incoming: readonly AdminIncidentFeedItem[],
): AdminIncidentFeedItem[] {
  const byId = new Map(current.map((row) => [row.incidentId, row]));
  for (const row of incoming) {
    const prev = byId.get(row.incidentId);
    if (!prev || prev.updatedAt <= row.updatedAt) {
      byId.set(row.incidentId, row);
    }
  }
  return [...byId.values()]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
    .slice(0, MAX_ROWS);
}

function isVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

/**
 * Polls `GET /admin/v1/incidents/feed` every 15s while the tab is visible, advancing `since` with the
 * server's `nextSince` (drains immediately while `hasMore`). Stops on a 404 (route not deployed).
 */
export function useIncidentFeed() {
  const [rows, setRows] = useState<AdminIncidentFeedItem[]>([]);
  const [lastPolledAt, setLastPolledAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notDeployed, setNotDeployed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sinceRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Read through a function so TS doesn't narrow the flag across the awaits below.
    const life = { cancelled: false };
    const isCancelled = () => life.cancelled;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void poll();
      }, ms);
    };

    const poll = async () => {
      if (isCancelled()) return;
      if (!isVisible()) return; // resumed by the visibilitychange listener
      controller = new AbortController();
      try {
        const page = await fetchIncidentsFeed(sinceRef.current, controller.signal);
        if (isCancelled()) return;
        setRows((current) => mergeIncidentFeed(current, page.items));
        if (page.feed) {
          sinceRef.current = page.feed.nextSince;
          setLastPolledAt(page.feed.serverTime);
        }
        setErrorMessage(null);
        schedule(page.feed?.hasMore ? 0 : INCIDENT_FEED_POLL_MS);
      } catch (error) {
        if (isCancelled() || (error instanceof DOMException && error.name === 'AbortError')) return;
        if (isAdminListNotDeployed(error)) {
          setNotDeployed(true);
          return;
        }
        setErrorMessage(mapAdminApiError(error).userMessage);
        schedule(INCIDENT_FEED_POLL_MS);
      } finally {
        if (!isCancelled()) setIsLoading(false);
      }
    };

    const onVisibility = () => {
      if (isVisible()) {
        schedule(0);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    void poll();

    return () => {
      life.cancelled = true;
      if (timer) clearTimeout(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { rows, lastPolledAt, errorMessage, notDeployed, isLoading };
}
