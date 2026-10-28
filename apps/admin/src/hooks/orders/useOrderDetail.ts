import { useQuery } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchOrderDetail } from '@/services/orders/order-detail-service';

export function useOrderDetail(orderId: string | null) {
  const query = useQuery({
    queryKey: ['admin', 'orders', 'detail', orderId],
    queryFn: ({ signal }) => fetchOrderDetail(orderId as string, signal),
    enabled: Boolean(orderId),
    retry: false,
    meta: { errorMessage: 'Unable to load order detail.' },
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
