import type {
  AdminTaxiFleetStatus,
  AdminTaxiFleetVehicleDetailDto,
  AdminTaxiMediaStatus,
} from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import {
  isAdminListNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import {
  fetchTaxiFleetPage,
  fetchTaxiFleetVehicle,
  submitTaxiFleetMediaRemove,
} from '@/services/taxi/taxi-v4-service';

export const TAXI_FLEET_PAGE_LIMIT = 25;

export const taxiFleetQueryKeys = {
  all: ['admin', 'taxi', 'fleet'] as const,
  list: (filters: Record<string, string>) => [...taxiFleetQueryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...taxiFleetQueryKeys.all, 'detail', id] as const,
};

export type TaxiFleetStatusFilter = AdminTaxiFleetStatus | 'ALL';
export type TaxiFleetCanBidFilter = 'ALL' | 'YES' | 'NO';
export type TaxiFleetMediaFilter = AdminTaxiMediaStatus | 'ALL';

export function useTaxiFleet() {
  const canRead = useAdminPermission('taxi:read');
  const [status, setStatus] = useUrlFilterState<TaxiFleetStatusFilter>('status', 'ALL');
  const [canBid, setCanBid] = useUrlFilterState<TaxiFleetCanBidFilter>('canBid', 'ALL');
  const [mediaStatus, setMediaStatus] = useUrlFilterState<TaxiFleetMediaFilter>('media', 'ALL');
  const [orgId, setOrgId] = useUrlTextState('org');
  const debouncedOrg = useDebouncedValue(orgId.trim(), 350);

  const filters = { status, canBid, mediaStatus, orgId: debouncedOrg };
  const query = useInfiniteQuery({
    queryKey: taxiFleetQueryKeys.list(filters),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiFleetPage(
        {
          ...(status !== 'ALL' ? { status } : {}),
          ...(canBid !== 'ALL' ? { canBid: canBid === 'YES' } : {}),
          ...(mediaStatus !== 'ALL' ? { mediaStatus } : {}),
          ...(debouncedOrg ? { orgId: debouncedOrg } : {}),
          limit: TAXI_FLEET_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    // A page scans ≤ 500 rows server-side, so a short page may still carry a cursor — follow it.
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
  });
  const vehicles = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    vehicles,
    status,
    setStatus,
    canBid,
    setCanBid,
    mediaStatus,
    setMediaStatus,
    orgId,
    setOrgId,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    notDeployed,
    userErrorMessage: query.isError && !notDeployed ? resolveSubmitErrorMessage(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

/** Fleet vehicle detail (signed URLs). Also used for taxi-bid driver identity. */
export function useTaxiFleetVehicle(id: string | null) {
  const query = useQuery({
    queryKey: taxiFleetQueryKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchTaxiFleetVehicle(id ?? '', signal),
    enabled: Boolean(id),
    retry: false,
    // Signed URLs live 300 s — never serve a stale copy from cache.
    staleTime: 0,
    gcTime: 60_000,
  });
  const notFound = query.error instanceof ApiError && query.error.status === 404;
  return {
    vehicle: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    notFound,
    userErrorMessage: query.isError && !notFound ? mapAdminApiError(query.error).userMessage : null,
    dataUpdatedAt: query.dataUpdatedAt,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useRemoveTaxiFleetMedia(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mediaId: string; reason: string }) =>
      submitTaxiFleetMediaRemove(vehicleId, input.mediaId, input.reason),
    retry: 0,
    onSuccess: (detail: AdminTaxiFleetVehicleDetailDto) => {
      queryClient.setQueryData(taxiFleetQueryKeys.detail(vehicleId), detail);
      void queryClient.invalidateQueries({ queryKey: [...taxiFleetQueryKeys.all, 'list'] });
      showSuccessToast('Media removed. The partner has been notified to re-capture it.');
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-fleet-media-remove', toast: false });
    },
  });
}

export function fleetActionErrorMessage(error: unknown): string {
  const mapped = mapAdminApiError(error);
  if (mapped.status === 404) return 'That media item no longer exists. Reopen the vehicle.';
  if (mapped.status === 409 && mapped.message.trim()) return mapped.message;
  return resolveSubmitErrorMessage(error);
}
