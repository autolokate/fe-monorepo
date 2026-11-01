import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ordersQueryKeys } from '@/hooks/orders/useOrders';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { showSuccessToast } from '@/platform/feedback/toast';
import { refundOrder } from '@/services/orders/orders-service';

export function useRefundOrder() {
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: ({
      orderId,
      reason,
      idempotencyKey,
    }: {
      orderId: string;
      reason: string;
      idempotencyKey: string;
    }) => refundOrder(orderId, reason, idempotencyKey),
    // Never auto-retry a money mutation: the dialog decides whether a retry reuses the key.
    retry: 0,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      showSuccessToast(
        result.state === 'REFUNDED'
          ? 'Refund processed by the payment provider.'
          : 'Refund accepted — settling with the payment provider (REFUND_PENDING).',
      );
    },
    // Failures are explained inline by the dialog (`classifyRefundError`), not as a generic toast.
  });

  return {
    refundMutation,
    mapMutationError: mapAdminApiError,
  };
}
