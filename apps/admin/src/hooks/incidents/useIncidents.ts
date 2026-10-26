import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  toIncidentsQueryStatus,
  type IncidentsStatusFilter,
} from '@/features/incidents/incidents-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchIncidentsPage } from '@/services/incidents/incidents-service';

export const incidentsQueryKeys = {
  all: ['admin', 'incidents'] as const,
  /** One key per consumed grant — status is filtered client-side (grants are single-use). */
  list: (approvalId: string) => [...incidentsQueryKeys.all, approvalId] as const,
};

/**
 * Incident list is enabled only when a dual-control `approvalId` is present.
 * Without it the UI stays fail-closed (no eager PII fetch).
 * Status chips filter the already-fetched page — changing them must not re-hit the API.
 */
export function useIncidents(
  approvalId: string | null,
  initialStatusFilter: IncidentsStatusFilter = 'ALL',
) {
  const [statusFilter, setStatusFilter] = useState<IncidentsStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: incidentsQueryKeys.list(approvalId ?? ''),
    queryFn: approvalId ? ({ signal }) => fetchIncidentsPage({ approvalId }, signal) : skipToken,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    meta: { errorMessage: 'Unable to load incidents.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'incidents', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const statusQuery = toIncidentsQueryStatus(statusFilter);
  const incidents = useMemo(() => {
    const items = query.data?.items ?? [];
    if (!statusQuery) return items;
    return items.filter((row) => row.status === statusQuery);
  }, [query.data?.items, statusQuery]);

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    incidents,
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      // Single-use grant — refresh requires a new dual-control approval; do not refetch.
    },
  };
}
