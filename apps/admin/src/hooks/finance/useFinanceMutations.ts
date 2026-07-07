import { useMutation } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors.js';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error.js';
import { showSuccessToast } from '@/platform/feedback/toast.js';
import {
  submitClawback,
  submitSettlementBatch,
} from '@/services/finance/finance-service.js';

export function useFinanceMutations() {
  const clawbackMutation = useMutation({
    mutationFn: ({ body, signal }: { body: Parameters<typeof submitClawback>[0]; signal?: AbortSignal }) =>
      submitClawback(body, signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Clawback recorded for ${result.paymentRef}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'finance:clawback', toast: true });
    },
  });

  const settlementMutation = useMutation({
    mutationFn: (signal?: AbortSignal) => submitSettlementBatch(signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(
        `Settlement batch complete — ${result.payouts.toLocaleString()} payouts created.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'finance:settlement', toast: true });
    },
  });

  return {
    clawbackMutation,
    settlementMutation,
    mapMutationError: mapAdminApiError,
  };
}
