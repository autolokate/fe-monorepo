import type { AdminTaxiRefundStatus } from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { taxiOpsQueryKeys } from '@/hooks/taxi/useTaxiOperations';
import {
  isAdminListNotDeployed,
  isAdminRouteNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { fetchTaxiRefundsPage, submitTaxiRefundRetry } from '@/services/taxi/taxi-v4-service';

export const TAXI_REFUNDS_PAGE_LIMIT = 25;

/** `NEEDS_ACTION` = no status sent → the server's default (FAILED + NEEDS_RECONCILIATION). */
export type TaxiRefundStatusFilter = AdminTaxiRefundStatus | 'NEEDS_ACTION';

const refundKeys = {
  all: ['admin', 'taxi', 'refunds'] as const,
  list: (status: string) => [...refundKeys.all, 'list', status] as const,
};

export function useTaxiRefunds() {
  const canRead = useAdminPermission('taxi:read');
  const queryClient = useQueryClient();
  const [status, setStatus] = useUrlFilterState<TaxiRefundStatusFilter>('status', 'NEEDS_ACTION');
  const query = useInfiniteQuery({
    queryKey: refundKeys.list(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiRefundsPage(
        {
          ...(status !== 'NEEDS_ACTION' ? { status } : {}),
          limit: TAXI_REFUNDS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
  });

  const retry = useMutation({
    mutationFn: (input: { id: string; reason: string; idempotencyKey: string }) =>
      submitTaxiRefundRetry(input.id, input.reason, input.idempotencyKey),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Refund resubmitted to the payment provider.');
      void queryClient.invalidateQueries({ queryKey: refundKeys.all });
      void queryClient.invalidateQueries({ queryKey: taxiOpsQueryKeys.all });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-refund-retry', toast: false });
    },
  });

  const refunds = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    refunds,
    status,
    setStatus,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    retry,
    retryError: retry.isError ? refundRetryErrorMessage(retry.error) : null,
  };
}

export function refundRetryErrorMessage(error: unknown): string {
  if (isAdminRouteNotDeployed(error)) return 'Refund retry is not available on this server yet.';
  if (error instanceof ApiError) {
    if (error.code === 'taxi_refund_not_retryable') {
      return 'This refund can no longer be retried (it may already be processing or processed). Refresh to see its state.';
    }
    if (error.code === 'conflict_idempotency') {
      return 'This retry key was already used for a different request. Close the dialog and start a new retry.';
    }
  }
  const mapped = mapAdminApiError(error);
  if (mapped.status === 409 && mapped.message.trim()) return mapped.message;
  return resolveSubmitErrorMessage(error);
}
