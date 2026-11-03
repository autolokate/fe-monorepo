import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import {
  isAdminListNotDeployed,
  isAdminRouteNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import {
  dateInputToExclusiveToIso,
  dateInputToFromIso,
  isDateRangeInverted,
} from '@/platform/utils/admin-date-range';
import {
  fetchGarageAccess,
  fetchGaragePassesPage,
  fetchGarageRevenuePage,
} from '@/services/garage/garage-access-service';

export const garageAccessQueryKeys = {
  all: ['admin', 'garage', 'access'] as const,
  access: (orgId: string) => [...garageAccessQueryKeys.all, 'org', orgId] as const,
  passes: (orgId: string) => [...garageAccessQueryKeys.all, 'passes', orgId] as const,
  revenue: (filters: Record<string, string>) =>
    [...garageAccessQueryKeys.all, 'revenue', filters] as const,
};

export const GARAGE_PASSES_PAGE_LIMIT = 20;
export const GARAGE_REVENUE_PAGE_LIMIT = 50;

/** Current weekly free-bid + pass state for one garage org (read before granting / adjusting). */
export function useGarageAccess(orgId: string | null) {
  const canRead = useAdminPermission('partners:read');
  const query = useQuery({
    queryKey: garageAccessQueryKeys.access(orgId ?? ''),
    queryFn: ({ signal }) => fetchGarageAccess(orgId ?? '', signal),
    enabled: canRead && Boolean(orgId),
    retry: false,
  });
  const notDeployed = query.isError && isAdminRouteNotDeployed(query.error);
  return {
    access: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useGaragePasses(orgId: string | null) {
  const canRead = useAdminPermission('partners:read');
  const query = useInfiniteQuery({
    queryKey: garageAccessQueryKeys.passes(orgId ?? ''),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchGaragePassesPage(
        orgId ?? '',
        { limit: GARAGE_PASSES_PAGE_LIMIT, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      ),
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead && Boolean(orgId),
    retry: false,
  });
  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminRouteNotDeployed(query.error);
  return {
    rows,
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
  };
}

/** Garage pass revenue — from/to are local days (`to` inclusive in the UI, exclusive on the wire). */
export function useGarageRevenue() {
  const canRead = useAdminPermission('partners:read');
  const [from, setFrom] = useUrlTextState('from');
  const [to, setTo] = useUrlTextState('to');
  const [orgId, setOrgId] = useUrlTextState('org');
  const debouncedOrg = useDebouncedValue(orgId.trim(), 350);
  const inverted = isDateRangeInverted(from, to);
  const fromIso = dateInputToFromIso(from);
  const toIso = dateInputToExclusiveToIso(to);

  const query = useInfiniteQuery({
    queryKey: garageAccessQueryKeys.revenue({
      from: fromIso ?? '',
      to: toIso ?? '',
      orgId: debouncedOrg,
    }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchGarageRevenuePage(
        {
          ...(fromIso ? { from: fromIso } : {}),
          ...(toIso ? { to: toIso } : {}),
          ...(debouncedOrg ? { orgId: debouncedOrg } : {}),
          limit: GARAGE_REVENUE_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead && !inverted,
    retry: false,
  });
  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const loadedTotalPaise = useMemo(
    () => rows.reduce((sum, row) => sum + row.amountPaise, 0),
    [rows],
  );
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    rows,
    loadedTotalPaise,
    from,
    setFrom,
    to,
    setTo,
    orgId,
    setOrgId,
    inverted,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    notDeployed,
    // A 400 (bad org id / date) carries the server's own explanation.
    userErrorMessage: query.isError && !notDeployed ? resolveSubmitErrorMessage(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
