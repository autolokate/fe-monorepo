import type { AdminPromoDto } from '@autolokate/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { promosQueryKeys } from '@/hooks/promos/promo-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { createPromo } from '@/services/promos/admin-promos-service';

export function usePromoMutations() {
  const queryClient = useQueryClient();

  const createPromoMutation = useMutation({
    mutationFn: ({ body, signal }: { body: Parameters<typeof createPromo>[0]; signal?: AbortSignal }) =>
      createPromo(body, signal),
    retry: 0,
    onSuccess: async (promo) => {
      queryClient.setQueriesData<AdminPromoDto[]>(
        { queryKey: promosQueryKeys.all },
        (current) => {
          if (!current) {
            return current;
          }
          if (current.some((entry) => entry.id === promo.id)) {
            return current.map((entry) => (entry.id === promo.id ? promo : entry));
          }
          return [promo, ...current];
        },
      );
      await queryClient.invalidateQueries({ queryKey: promosQueryKeys.all });
      showSuccessToast(`Promo ${promo.code} created.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'promos:create', toast: true });
    },
  });

  return {
    createPromoMutation,
    mapMutationError: mapAdminApiError,
  };
}
