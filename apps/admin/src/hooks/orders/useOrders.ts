import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { toOrdersQueryStatus, type OrdersStatusFilter } from '@/features/orders/orders-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchOrdersPage } from '@/services/orders/orders-service';

export const ordersQueryKeys = {
  all: ['admin', 'orders'] as const,
  list: (statusFilter: OrdersStatusFilter) =>
    [...ordersQueryKeys.all, { status: toOrdersQueryStatus(statusFilter) }] as const,
};

export function useOrders(initialStatusFilter: OrdersStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<OrdersStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: ordersQueryKeys.list(statusFilter),
    queryFn: ({ signal }) => fetchOrdersPage({ status: toOrdersQueryStatus(statusFilter) }, signal),
    meta: { errorMessage: 'Unable to load orders.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'orders', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const orders = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    orders,
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
