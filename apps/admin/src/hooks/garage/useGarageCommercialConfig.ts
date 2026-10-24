import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { UpdateGarageCommercialConfigBody } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  fetchGarageCommercialConfig,
  fetchGarageCommercialConfigHistory,
  saveGarageCommercialConfig,
} from '@/services/garage/garage-commercial-config-service';

export const garageCommercialConfigQueryKey = ['admin', 'garage', 'commercial-config'] as const;
export const garageCommercialConfigHistoryQueryKey = [
  'admin',
  'garage',
  'commercial-config',
  'history',
] as const;

export function useGarageCommercialConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: garageCommercialConfigQueryKey,
    queryFn: ({ signal }) => fetchGarageCommercialConfig(signal),
    meta: { errorMessage: 'Unable to load Garage commercial configuration.' },
  });

  const historyQuery = useQuery({
    queryKey: garageCommercialConfigHistoryQueryKey,
    queryFn: ({ signal }) => fetchGarageCommercialConfigHistory(signal),
    meta: { errorMessage: 'Unable to load Garage commercial configuration history.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'garage-commercial-config', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const mutation = useMutation({
    mutationFn: (body: UpdateGarageCommercialConfigBody) => saveGarageCommercialConfig(body),
    onSuccess: (data) => {
      queryClient.setQueryData(garageCommercialConfigQueryKey, data);
      void queryClient.invalidateQueries({ queryKey: garageCommercialConfigHistoryQueryKey });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-commercial-config-update', toast: true });
    },
  });

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;
  const saveErrorMessage = mutation.isError ? mapAdminApiError(mutation.error).userMessage : null;
  const historyErrorMessage = historyQuery.isError
    ? mapAdminApiError(historyQuery.error).userMessage
    : null;

  return {
    ...query,
    config: query.data ?? null,
    history: historyQuery.data ?? [],
    isHistoryLoading: historyQuery.isLoading,
    historyErrorMessage,
    userErrorMessage,
    saveErrorMessage,
    isSaving: mutation.isPending,
    isFetching: query.isFetching || historyQuery.isFetching,
    save: (body: UpdateGarageCommercialConfigBody) => mutation.mutateAsync(body),
    refresh: () => {
      void query.refetch();
      void historyQuery.refetch();
    },
  };
}
