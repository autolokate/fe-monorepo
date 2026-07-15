import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ordersQueryKeys } from '@/hooks/orders/useOrders';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { refundOrder } from '@/services/orders/orders-service';

export function useRefundOrder() {
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: ({
      orderId,
      reason,
      signal,
    }: {
      orderId: string;
      reason: string;
      signal?: AbortSignal;
    }) => refundOrder(orderId, reason, signal),
    retry: 0,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      // The refund is async — it settles at REFUND_PENDING here and REFUNDED lands later via webhook.
      showSuccessToast(`Refund initiated — ${result.state}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'orders:refund', toast: true });
    },
  });

  return {
    refundMutation,
    mapMutationError: mapAdminApiError,
  };
}
