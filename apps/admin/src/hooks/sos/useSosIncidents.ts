import { ApiError, type AdminSosSummary } from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { loadSosSnapshot, SOS_POLL_MS, type SosListSnapshot } from '@/features/sos/sos-list-sync';
import { isSosTerminal, mergeSosIncidents } from '@/features/sos/sos-model';
import { isAdminListNotDeployed } from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  fetchSosIncident,
  fetchSosIncidents,
  runSosOperatorAction,
  type SosOperatorAction,
} from '@/services/sos/sos-service';

export const sosQueryKeys = {
  all: ['admin', 'sos'] as const,
  list: () => [...sosQueryKeys.all, 'list'] as const,
  detail: (incidentId: string) => [...sosQueryKeys.all, 'detail', incidentId] as const,
};

/** Stop polling on errors a retry cannot fix (route absent, forbidden / step-up, unknown id). */
function pollUnlessFatal(intervalMs: number) {
  return (query: { state: { error: unknown } }): number | false => {
    const error = query.state.error;
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return false;
    return intervalMs;
  };
}

/**
 * Live SOS list. Polls every `pollMs` (default 5 s) while the tab is visible — TanStack pauses
 * `refetchInterval` in a hidden tab and refetches on focus. Incremental `updatedSince` reads merge
 * into the cached snapshot; a full read every minute heals drift. Every read is audited server-side.
 */
export function useSosIncidents(options: { pollMs?: number; enabled?: boolean } = {}) {
  const canView = useAdminPermission('sos:view');
  const queryClient = useQueryClient();
  const key = sosQueryKeys.list();
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      loadSosSnapshot(queryClient.getQueryData<SosListSnapshot>(key) ?? null, Date.now(), (q) =>
        fetchSosIncidents(q, signal),
      ),
    enabled: canView && options.enabled !== false,
    refetchInterval: pollUnlessFatal(options.pollMs ?? SOS_POLL_MS),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  });
  const notDeployed = query.isError && isAdminListNotDeployed(query.error) && !query.data;
  return {
    ...query,
    rows: query.data?.rows ?? [],
    capped: query.data?.capped ?? false,
    notDeployed,
    canView,
  };
}

/** Full incident detail, re-read every 5 s while open (live location trail, calls, timeline). */
export function useSosIncidentDetail(incidentId: string | null) {
  const canView = useAdminPermission('sos:view');
  return useQuery({
    queryKey: sosQueryKeys.detail(incidentId ?? 'none'),
    queryFn: ({ signal }) => fetchSosIncident(incidentId ?? '', signal),
    enabled: canView && incidentId !== null,
    // A closed incident no longer changes — stop the (audited) 5 s re-reads.
    refetchInterval: (query) =>
      query.state.data && isSosTerminal(query.state.data.state)
        ? false
        : pollUnlessFatal(SOS_POLL_MS)(query),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  });
}

/**
 * One operator action. Never optimistic: on success the returned summary row is merged into the
 * cached list, and both the list and the detail are refetched so the console shows server truth
 * (also after a 409 — the incident moved on).
 */
export function useSosAction(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: SosOperatorAction) => runSosOperatorAction(incidentId, action),
    onSuccess: (summary: AdminSosSummary) => {
      queryClient.setQueryData<SosListSnapshot>(sosQueryKeys.list(), (current) =>
        current ? { ...current, rows: mergeSosIncidents(current.rows, [summary]) } : current,
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sosQueryKeys.detail(incidentId) }),
        queryClient.invalidateQueries({ queryKey: sosQueryKeys.list() }),
      ]);
    },
  });
}

/** Re-render clock for countdowns / "time since" (1 s by default). */
export function useNow(intervalMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
