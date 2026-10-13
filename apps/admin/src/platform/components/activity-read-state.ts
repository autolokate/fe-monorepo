import { useCallback, useState } from 'react';

/**
 * Per-browser read/dismiss state for the header activity feed. The backend has no notifications
 * resource (the feed is the latest audit events), so "read" and "dismissed" live in localStorage.
 */
const STORAGE_KEY = 'al-admin-activity-state-v1';
const MAX_TRACKED_IDS = 200;

type ActivityReadState = {
  /** Everything at or before this ISO timestamp counts as read. */
  readThrough: string | null;
  readIds: string[];
  dismissedIds: string[];
};

const EMPTY_STATE: ActivityReadState = { readThrough: null, readIds: [], dismissedIds: [] };

function loadState(): ActivityReadState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<ActivityReadState>;
    return {
      readThrough: typeof parsed.readThrough === 'string' ? parsed.readThrough : null,
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(state: ActivityReadState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — read state simply won't persist across reloads.
  }
}

function appendIds(existing: string[], ids: string[]): string[] {
  const merged = [...existing.filter((id) => !ids.includes(id)), ...ids];
  return merged.slice(-MAX_TRACKED_IDS);
}

type FeedEvent = { id: string; at: string };

export function useActivityReadState() {
  const [state, setState] = useState<ActivityReadState>(loadState);

  const update = useCallback((next: (current: ActivityReadState) => ActivityReadState) => {
    setState((current) => {
      const value = next(current);
      saveState(value);
      return value;
    });
  }, []);

  const isUnread = useCallback(
    (event: FeedEvent) => {
      if (state.readIds.includes(event.id)) {
        return false;
      }
      return state.readThrough === null || Date.parse(event.at) > Date.parse(state.readThrough);
    },
    [state.readIds, state.readThrough],
  );

  const isDismissed = useCallback(
    (event: FeedEvent) => state.dismissedIds.includes(event.id),
    [state.dismissedIds],
  );

  const markRead = useCallback(
    (id: string) => {
      update((current) => ({ ...current, readIds: appendIds(current.readIds, [id]) }));
    },
    [update],
  );

  const markAllRead = useCallback(
    (events: FeedEvent[]) => {
      const newest = events.reduce<string | null>(
        (latest, event) =>
          latest === null || Date.parse(event.at) > Date.parse(latest) ? event.at : latest,
        null,
      );
      if (newest === null) {
        return;
      }
      update((current) => ({
        ...current,
        readThrough:
          current.readThrough !== null && Date.parse(current.readThrough) > Date.parse(newest)
            ? current.readThrough
            : newest,
      }));
    },
    [update],
  );

  const dismiss = useCallback(
    (ids: string[]) => {
      update((current) => ({
        ...current,
        dismissedIds: appendIds(current.dismissedIds, ids),
        readIds: appendIds(current.readIds, ids),
      }));
    },
    [update],
  );

  return { isUnread, isDismissed, markRead, markAllRead, dismiss };
}
