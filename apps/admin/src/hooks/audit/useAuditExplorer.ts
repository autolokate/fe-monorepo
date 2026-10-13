import type { AuditExplorerFilters } from '@/features/audit/audit-filters';
import { toAuditQueryParams } from '@/features/audit/audit-filters';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { auditQueryKeys } from '@/hooks/audit/audit-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAuditEventsPage } from '@/services/audit/audit-events-service';

export function useAuditExplorer(filters: AuditExplorerFilters) {
  const queryParams = useMemo(() => toAuditQueryParams(filters), [filters]);

  const query = useInfiniteQuery({
    queryKey: auditQueryKeys.explorer(queryParams),
    queryFn: ({ pageParam, signal }) =>
      fetchAuditEventsPage(
        {
          ...queryParams,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasMore) {
        return undefined;
      }
      return lastPage.pagination.nextCursor ?? undefined;
    },
    meta: { errorMessage: 'Unable to load audit events.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      // An older-page failure is surfaced inline beside "Load older events", not as a toast.
      reportAdminApiError(query.error, {
        context: 'audit-events',
        toast: !query.isFetchNextPageError,
      });
    }
  }, [query.data, query.error, query.isError, query.isFetchNextPageError]);

  const events = useMemo(
    () => query.data?.pages.flatMap((page) => page.events) ?? [],
    [query.data],
  );

  const latestPage = query.data?.pages.at(-1);
  const hasMore = latestPage?.pagination?.hasMore ?? false;
  const requestMeta = latestPage
    ? { requestId: latestPage.requestId, correlationId: latestPage.correlationId }
    : null;

  const errorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;
  const userErrorMessage = query.isFetchNextPageError ? null : errorMessage;
  const loadOlderErrorMessage = query.isFetchNextPageError ? errorMessage : null;

  return {
    events,
    hasMore,
    requestMeta,
    loadOlderErrorMessage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
    loadOlder: () => {
      void query.fetchNextPage();
    },
  };
}
