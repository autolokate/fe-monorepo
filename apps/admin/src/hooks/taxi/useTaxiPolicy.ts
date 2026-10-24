import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { normalizeApiError } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  fetchTaxiPolicy,
  fetchTaxiPolicyHistory,
  publishTaxiPolicyDraft,
  saveTaxiPolicyDraft,
} from '@/services/taxi/taxi-policy-service';

export const taxiPolicyQueryKey = ['admin', 'taxi', 'policy'] as const;
export const taxiPolicyHistoryQueryKey = ['admin', 'taxi', 'policy', 'history'] as const;

function isUnavailableError(error: unknown): boolean {
  const normalized = normalizeApiError(error);
  const blob = `${normalized.code} ${normalized.message}`.toLowerCase();
  return (
    normalized.status === 503 ||
    blob.includes('taxi_policy_unavailable') ||
    blob.includes('unavailable')
  );
}

/**
 * Admin Taxi policy read/write — Nest `/admin/v1/taxi/policy*`.
 * Requires OPERATOR + step_up on Live; 503 until Taxi migrate has a policy row.
 */
export function useTaxiPolicy() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: taxiPolicyQueryKey,
    queryFn: ({ signal }) => fetchTaxiPolicy(signal),
    meta: { errorMessage: 'Unable to load Taxi policy.' },
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: taxiPolicyHistoryQueryKey,
    queryFn: ({ signal }) => fetchTaxiPolicyHistory(signal),
    meta: { errorMessage: 'Unable to load Taxi policy history.' },
    retry: false,
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'taxi-policy', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => saveTaxiPolicyDraft(body),
    onSuccess: (data) => {
      queryClient.setQueryData(taxiPolicyQueryKey, data);
      void queryClient.invalidateQueries({ queryKey: taxiPolicyHistoryQueryKey });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-policy-update', toast: true });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTaxiPolicyDraft(),
    onSuccess: (data) => {
      queryClient.setQueryData(taxiPolicyQueryKey, data);
      void queryClient.invalidateQueries({ queryKey: taxiPolicyHistoryQueryKey });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-policy-publish', toast: true });
    },
  });

  const isUnavailable = query.isError && isUnavailableError(query.error);
  const userErrorMessage =
    query.isError && !isUnavailable ? mapAdminApiError(query.error).userMessage : null;
  const saveErrorMessage = saveMutation.isError
    ? mapAdminApiError(saveMutation.error).userMessage
    : null;
  const publishErrorMessage = publishMutation.isError
    ? mapAdminApiError(publishMutation.error).userMessage
    : null;

  return {
    policy: query.data ?? null,
    history: historyQuery.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching || historyQuery.isFetching,
    isUnavailable,
    userErrorMessage,
    saveErrorMessage,
    publishErrorMessage,
    isSaving: saveMutation.isPending,
    isPublishing: publishMutation.isPending,
    save: (body: Record<string, unknown>) => saveMutation.mutateAsync(body),
    publish: () => publishMutation.mutateAsync(),
    refresh: () => {
      void query.refetch();
      void historyQuery.refetch();
    },
  };
}
