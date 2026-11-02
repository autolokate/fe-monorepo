import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  toPaymentsQueryOutcome,
  type PaymentsOutcomeFilter,
} from '@/features/payments/payments-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { ADMIN_LIST_PAGE_SIZE, nextCursorOf } from '@/platform/query/cursor-pages';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchPaymentsPage } from '@/services/payments/payments-service';

export const paymentsQueryKeys = {
  all: ['admin', 'payments'] as const,
  list: (outcomeFilter: PaymentsOutcomeFilter) =>
    [...paymentsQueryKeys.all, { outcome: toPaymentsQueryOutcome(outcomeFilter) }] as const,
};

export function usePayments(initialOutcomeFilter: PaymentsOutcomeFilter = 'ALL') {
  const [outcomeFilter, setOutcomeFilter] = useState<PaymentsOutcomeFilter>(initialOutcomeFilter);

  const query = useInfiniteQuery({
    queryKey: paymentsQueryKeys.list(outcomeFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchPaymentsPage(
        {
          outcome: toPaymentsQueryOutcome(outcomeFilter),
          limit: ADMIN_LIST_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorOf,
    meta: { errorMessage: 'Unable to load payments.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'payments', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const payments = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const hasMore = query.hasNextPage;

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    payments,
    hasMore,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    outcomeFilter,
    setOutcomeFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
