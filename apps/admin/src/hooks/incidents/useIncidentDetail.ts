import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchIncident } from '@/services/incidents/incidents-service';

export const incidentDetailQueryKeys = {
  all: ['admin', 'incidents', 'detail'] as const,
  one: (incidentId: string, approvalId: string) =>
    [...incidentDetailQueryKeys.all, incidentId, approvalId] as const,
};

/**
 * Incident detail is enabled only with a dual-control `approvalId` scoped to
 * INCIDENT_DETAIL:{incidentId}. Grants are single-use — do not refetch.
 */
export function useIncidentDetail(incidentId: string | null, approvalId: string | null) {
  const query = useQuery({
    queryKey: incidentDetailQueryKeys.one(incidentId ?? '', approvalId ?? ''),
    queryFn: ({ signal }) => fetchIncident(incidentId!, approvalId!, signal),
    enabled: Boolean(incidentId && approvalId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    meta: { errorMessage: 'Unable to load incident detail.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'incident-detail', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  return {
    ...query,
    detail: query.data ?? null,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
  };
}
