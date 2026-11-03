import type { AdminScanLookupResult } from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  fetchActiveVehicleDuplicates,
  fetchPlateCollisions,
  fetchScanAbuse,
  fetchScanLookups,
  fetchUnparsedPlates,
  submitClearScanFlag,
  submitPlateKeyBackfill,
} from '@/services/users/admin-users-v4-service';

export const plateScanningKeys = {
  all: ['admin', 'plate-scanning'] as const,
  lookups: (filters: Record<string, string | number>) =>
    [...plateScanningKeys.all, 'lookups', filters] as const,
  abuse: (hours: number) => [...plateScanningKeys.all, 'abuse', hours] as const,
  collisions: (limit: number) => [...plateScanningKeys.all, 'collisions', limit] as const,
  unparsed: (limit: number) => [...plateScanningKeys.all, 'unparsed', limit] as const,
  duplicates: ['admin', 'plate-scanning', 'duplicates'] as const,
};

/** The shared read shape: 404 → not deployed, other failures → a user-safe message. */
function readState<T>(query: {
  data: T | undefined;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}) {
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    notDeployed,
    error: query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export const LOOKUP_LIMIT = 200;

export function useScanLookups(filters: {
  accountId: string;
  result: AdminScanLookupResult | 'ALL';
  hours: number;
}) {
  const query = useQuery({
    queryKey: plateScanningKeys.lookups(filters),
    queryFn: ({ signal }) =>
      fetchScanLookups(
        {
          ...(filters.accountId ? { accountId: filters.accountId } : {}),
          ...(filters.result !== 'ALL' ? { result: filters.result } : {}),
          hours: filters.hours,
          limit: LOOKUP_LIMIT,
        },
        signal,
      ),
    retry: 0,
  });
  return readState(query);
}

export function useScanAbuse(hours: number) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: plateScanningKeys.abuse(hours),
    queryFn: ({ signal }) => fetchScanAbuse(hours, signal),
    retry: 0,
  });
  const clearMutation = useMutation({
    mutationFn: (flagId: string) => submitClearScanFlag(flagId),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Flag cleared — the scanner is unblocked.');
      void queryClient.invalidateQueries({ queryKey: [...plateScanningKeys.all, 'abuse'] });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'plate-scanning:clear-flag', toast: false });
    },
  });
  return { ...readState(query), clearMutation };
}

export function usePlateCollisions(limit: number) {
  const query = useQuery({
    queryKey: plateScanningKeys.collisions(limit),
    queryFn: ({ signal }) => fetchPlateCollisions(limit, signal),
    retry: 0,
  });
  return readState(query);
}

export function useUnparsedPlates(limit: number) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: plateScanningKeys.unparsed(limit),
    queryFn: ({ signal }) => fetchUnparsedPlates(limit, signal),
    retry: 0,
  });
  const backfillMutation = useMutation({
    mutationFn: () => submitPlateKeyBackfill(),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast(`Backfill batch done — ${String(result.keyed)} keyed.`);
      void queryClient.invalidateQueries({ queryKey: [...plateScanningKeys.all, 'unparsed'] });
      void queryClient.invalidateQueries({ queryKey: [...plateScanningKeys.all, 'collisions'] });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'plate-scanning:backfill', toast: false });
    },
  });
  return { ...readState(query), backfillMutation };
}

export function useActiveVehicleDuplicates() {
  const query = useQuery({
    queryKey: plateScanningKeys.duplicates,
    queryFn: ({ signal }) => fetchActiveVehicleDuplicates(signal),
    retry: 0,
  });
  return readState(query);
}
