import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  toSubscriptionsQueryStatus,
  type SubscriptionsStatusFilter,
} from '@/features/subscriptions/subscriptions-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchSubscriptions } from '@/services/subscriptions/subscriptions-service';

export const subscriptionsQueryKeys = {
  all: ['admin', 'subscriptions'] as const,
  list: (statusFilter: SubscriptionsStatusFilter) =>
    [...subscriptionsQueryKeys.all, { status: toSubscriptionsQueryStatus(statusFilter) }] as const,
};

export function useSubscriptions(initialStatusFilter: SubscriptionsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<SubscriptionsStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: subscriptionsQueryKeys.list(statusFilter),
    queryFn: ({ signal }) =>
      fetchSubscriptions({ status: toSubscriptionsQueryStatus(statusFilter) }, signal),
    meta: { errorMessage: 'Unable to load subscriptions.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'subscriptions', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const subscriptions = query.data ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    subscriptions,
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
