import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  toIncidentsQueryStatus,
  type IncidentsStatusFilter,
} from '@/features/incidents/incidents-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchIncidentsPage } from '@/services/incidents/incidents-service';

export const incidentsQueryKeys = {
  all: ['admin', 'incidents'] as const,
  list: (statusFilter: IncidentsStatusFilter) =>
    [...incidentsQueryKeys.all, { status: toIncidentsQueryStatus(statusFilter) }] as const,
};

export function useIncidents(initialStatusFilter: IncidentsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<IncidentsStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: incidentsQueryKeys.list(statusFilter),
    queryFn: ({ signal }) =>
      fetchIncidentsPage({ status: toIncidentsQueryStatus(statusFilter) }, signal),
    meta: { errorMessage: 'Unable to load incidents.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'incidents', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const incidents = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    incidents,
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
