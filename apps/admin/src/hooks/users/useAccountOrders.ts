import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchOrdersPage } from '@/services/orders/orders-service';

export const accountOrdersQueryKeys = {
  all: ['admin', 'users', 'orders'] as const,
  list: (accountId: string) => [...accountOrdersQueryKeys.all, accountId] as const,
};

/**
 * The resolved account's orders, for the customer drill-down. Sibling to `useOrders`, which is
 * status-filtered for the console grid; this one scopes the same `GET /admin/v1/orders` list by
 * `accountId` and carries no status filter.
 */
export function useAccountOrders(accountId: string) {
  const query = useQuery({
    queryKey: accountOrdersQueryKeys.list(accountId),
    queryFn: ({ signal }) => fetchOrdersPage({ accountId }, signal),
    meta: { errorMessage: 'Unable to load orders for this account.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'users:account-orders', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const orders = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    orders,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
