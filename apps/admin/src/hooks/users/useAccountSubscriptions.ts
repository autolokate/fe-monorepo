import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchSubscriptions } from '@/services/subscriptions/subscriptions-service';

export const accountSubscriptionsQueryKeys = {
  all: ['admin', 'users', 'subscriptions'] as const,
  list: (accountId: string) => [...accountSubscriptionsQueryKeys.all, accountId] as const,
};

/**
 * The resolved account's subscriptions, for the customer drill-down. Sibling to `useSubscriptions`,
 * which is status-filtered for the console grid; this one scopes the same `GET /admin/v1/subscriptions`
 * list by `accountId` and carries no status filter.
 */
export function useAccountSubscriptions(accountId: string) {
  const query = useQuery({
    queryKey: accountSubscriptionsQueryKeys.list(accountId),
    queryFn: ({ signal }) => fetchSubscriptions({ accountId }, signal),
    meta: { errorMessage: 'Unable to load subscriptions for this account.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'users:account-subscriptions', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const subscriptions = query.data ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    subscriptions,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
