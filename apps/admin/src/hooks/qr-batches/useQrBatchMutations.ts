import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory.js';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors.js';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error.js';
import { showSuccessToast } from '@/platform/feedback/toast.js';
import {
  createBatch,
  fulfilPartnerReorderById,
  generateBatchCodes,
  provisionBatch,
  replaceCode,
  retireCode,
  runAutoDetachSweep,
} from '@/services/qr-batches/qr-batch-service.js';

export function useQrBatchMutations() {
  const queryClient = useQueryClient();

  const invalidateInventory = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
  };

  const createBatchMutation = useMutation({
    mutationFn: ({ body, signal }: { body: Parameters<typeof createBatch>[0]; signal?: AbortSignal }) =>
      createBatch(body, signal),
    retry: 0,
    onSuccess: async (batch) => {
      await invalidateInventory();
      showSuccessToast(`Batch ${batch.batchCode} created.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:create', toast: true });
    },
  });

  const generateMutation = useMutation({
    mutationFn: ({ batchId, signal }: { batchId: string; signal?: AbortSignal }) =>
      generateBatchCodes(batchId, signal),
    retry: 0,
    onSuccess: async (batch) => {
      await invalidateInventory();
      showSuccessToast(`Codes generated for ${batch.batchCode}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:generate', toast: true });
    },
  });

  const provisionMutation = useMutation({
    mutationFn: ({ batchId, signal }: { batchId: string; signal?: AbortSignal }) =>
      provisionBatch(batchId, signal),
    retry: 0,
    onSuccess: async (batch) => {
      await invalidateInventory();
      showSuccessToast(`Batch ${batch.batchCode} provisioned.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:provision', toast: true });
    },
  });

  const sweepMutation = useMutation({
    mutationFn: (signal?: AbortSignal) => runAutoDetachSweep(signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(
        `Sweep complete — ${result.detached.toLocaleString()} detached, ${result.skippedPaid.toLocaleString()} skipped (paid).`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:sweep', toast: true });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: ({ code, signal }: { code: string; signal?: AbortSignal }) => replaceCode(code, signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Replaced ${result.oldCode} with ${result.newCode}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:replace', toast: true });
    },
  });

  const retireMutation = useMutation({
    mutationFn: ({ code, signal }: { code: string; signal?: AbortSignal }) => retireCode(code, signal),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Retired QR code ${result.code}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:retire', toast: true });
    },
  });

  const fulfilReorderMutation = useMutation({
    mutationFn: ({ reorderId, signal }: { reorderId: string; signal?: AbortSignal }) =>
      fulfilPartnerReorderById(reorderId, signal),
    retry: 0,
    onSuccess: async (result) => {
      await invalidateInventory();
      showSuccessToast(
        `Reorder fulfilled — ${result.allocated.toLocaleString()} codes allocated.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'qr-batches:fulfil-reorder', toast: true });
    },
  });

  return {
    createBatchMutation,
    generateMutation,
    provisionMutation,
    sweepMutation,
    replaceMutation,
    retireMutation,
    fulfilReorderMutation,
    mapMutationError: mapAdminApiError,
  };
}
