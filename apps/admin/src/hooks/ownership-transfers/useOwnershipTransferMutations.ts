import { useMutation } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors.js';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error.js';
import { showSuccessToast } from '@/platform/feedback/toast.js';
import {
  submitApproveOwnershipTransfer,
  submitInitiateOwnershipTransfer,
} from '@/services/ownership-transfers/ownership-transfer-service.js';

export function useOwnershipTransferMutations() {
  const initiateMutation = useMutation({
    mutationFn: ({
      body,
      signal,
    }: {
      body: Parameters<typeof submitInitiateOwnershipTransfer>[0];
      signal?: AbortSignal;
    }) => submitInitiateOwnershipTransfer(body, signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Transfer ${result.transferId} initiated.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'ownership-transfers:initiate', toast: true });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({
      transferId,
      body,
      signal,
    }: {
      transferId: string;
      body: Parameters<typeof submitApproveOwnershipTransfer>[1];
      signal?: AbortSignal;
    }) => submitApproveOwnershipTransfer(transferId, body, signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Transfer ${result.transferId} completed.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'ownership-transfers:approve', toast: true });
    },
  });

  return {
    initiateMutation,
    approveMutation,
    mapMutationError: mapAdminApiError,
  };
}
