import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  toSupportQueryStatus,
  toSupportQueryType,
  type SupportStatusFilter,
  type SupportTypeFilter,
} from '@/features/support/support-filters';
import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchSupportTicket, fetchSupportTicketsPage } from '@/services/support/support-service';

const SUPPORT_PAGE_LIMIT = 50;

export const supportTicketsQueryKeys = {
  all: ['admin', 'support-tickets'] as const,
  list: (statusFilter: SupportStatusFilter, typeFilter: SupportTypeFilter) =>
    [
      ...supportTicketsQueryKeys.all,
      'list',
      {
        status: toSupportQueryStatus(statusFilter),
        type: toSupportQueryType(typeFilter),
      },
    ] as const,
  detail: (ticketId: string) => [...supportTicketsQueryKeys.all, 'detail', ticketId] as const,
};

export function useSupportTickets(
  initialStatusFilter: SupportStatusFilter = 'OPEN',
  initialTypeFilter: SupportTypeFilter = 'ALL',
) {
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState<SupportTypeFilter>(initialTypeFilter);

  const query = useInfiniteQuery({
    queryKey: supportTicketsQueryKeys.list(statusFilter, typeFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchSupportTicketsPage(
        {
          status: toSupportQueryStatus(statusFilter),
          type: toSupportQueryType(typeFilter),
          limit: SUPPORT_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    retry: (count, error) => !isAdminListNotDeployed(error) && count < 2,
    meta: { errorMessage: 'Unable to load support tickets.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'support', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const tickets = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const hasMore = query.data?.pages.at(-1)?.pagination?.hasMore ?? false;

  return {
    tickets,
    hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    notDeployed: query.isError && isAdminListNotDeployed(query.error),
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    loadMore: () => {
      void query.fetchNextPage();
    },
  };
}

export function useSupportTicketDetail(ticketId: string | null) {
  const query = useQuery({
    queryKey: supportTicketsQueryKeys.detail(ticketId ?? 'idle'),
    queryFn: ({ signal }) => {
      if (!ticketId) {
        throw new Error('ticketId required');
      }
      return fetchSupportTicket(ticketId, signal);
    },
    enabled: Boolean(ticketId),
    retry: 0,
  });

  return {
    ticket: query.data ?? null,
    isLoading: query.isLoading,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
  };
}
