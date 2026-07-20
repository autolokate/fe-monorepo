import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManualShipmentStatus } from '@autolokate/api-client';

import { shipmentsQueryKeys } from '@/hooks/shipments/useShipments';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { updateShipmentStatus } from '@/services/shipments/shipments-service';

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      signal,
    }: {
      orderId: string;
      status: ManualShipmentStatus;
      signal?: AbortSignal;
    }) => updateShipmentStatus(orderId, status, signal),
    retry: 0,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: shipmentsQueryKeys.all });
      showSuccessToast(`Order ${result.orderNumber} marked ${result.status}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'shipments:update-status', toast: true });
    },
  });

  return {
    updateMutation,
    mapMutationError: mapAdminApiError,
  };
}
