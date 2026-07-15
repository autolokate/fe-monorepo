import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  toSupportQueryStatus,
  toSupportQueryType,
  type SupportStatusFilter,
  type SupportTypeFilter,
} from '@/features/support/support-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchSupportTicketsPage } from '@/services/support/support-service';

export const supportTicketsQueryKeys = {
  all: ['admin', 'support-tickets'] as const,
  list: (statusFilter: SupportStatusFilter, typeFilter: SupportTypeFilter) =>
    [
      ...supportTicketsQueryKeys.all,
      {
        status: toSupportQueryStatus(statusFilter),
        type: toSupportQueryType(typeFilter),
      },
    ] as const,
};

export function useSupportTickets(
  initialStatusFilter: SupportStatusFilter = 'ALL',
  initialTypeFilter: SupportTypeFilter = 'ALL',
) {
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState<SupportTypeFilter>(initialTypeFilter);

  const query = useQuery({
    queryKey: supportTicketsQueryKeys.list(statusFilter, typeFilter),
    queryFn: ({ signal }) =>
      fetchSupportTicketsPage(
        {
          status: toSupportQueryStatus(statusFilter),
          type: toSupportQueryType(typeFilter),
        },
        signal,
      ),
    meta: { errorMessage: 'Unable to load support tickets.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'support', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const tickets = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    tickets,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
