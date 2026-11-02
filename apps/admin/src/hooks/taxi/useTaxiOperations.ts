import type {
  AdminTaxiBookingMutationDto,
  AdminTaxiBookingStatus,
  AdminTaxiDisputeResolution,
  AdminTaxiEnrollmentStatus,
  AdminTaxiRevenueKind,
  CancelAdminTaxiBookingBody,
} from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  isAdminListNotDeployed,
  isAdminRouteNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  fetchTaxiBooking,
  fetchTaxiBookingsPage,
  fetchTaxiEnrollmentsPage,
  submitTaxiBookingCancel,
  submitTaxiDepositRelease,
  submitTaxiDisputeResolve,
  fetchTaxiRevenuePage,
  submitTaxiEnrollmentReinstate,
  submitTaxiEnrollmentSuspend,
} from '@/services/taxi/taxi-operations-service';
import { useUrlFilterState, useUrlFlagState } from '@/platform/state/useUrlFilterState';

export const TAXI_OPS_PAGE_LIMIT = 25;

export const taxiOpsQueryKeys = {
  all: ['admin', 'taxi', 'ops'] as const,
  bookings: (status: string, flagged: boolean) =>
    [...taxiOpsQueryKeys.all, 'bookings', status, flagged] as const,
  revenue: (filters: Record<string, string>) =>
    [...taxiOpsQueryKeys.all, 'revenue', filters] as const,
  booking: (id: string) => [...taxiOpsQueryKeys.all, 'booking', id] as const,
  enrollments: (status: string) => [...taxiOpsQueryKeys.all, 'enrollments', status] as const,
};

export function useTaxiBookings() {
  const canRead = useAdminPermission('taxi:read');
  const [status, setStatus] = useUrlFilterState<AdminTaxiBookingStatus | 'ALL'>('status', 'ALL');
  const [flagged, setFlagged] = useUrlFlagState('flagged');
  const query = useInfiniteQuery({
    queryKey: taxiOpsQueryKeys.bookings(status, flagged),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiBookingsPage(
        {
          ...(status !== 'ALL' ? { status } : {}),
          ...(flagged ? { flagged: true } : {}),
          limit: TAXI_OPS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: canRead,
    retry: false,
  });
  const bookings = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    ...query,
    bookings,
    status,
    setStatus,
    flagged,
    setFlagged,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useTaxiBooking(bookingId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: taxiOpsQueryKeys.booking(bookingId),
    queryFn: ({ signal }) => fetchTaxiBooking(bookingId, signal),
    enabled: bookingId.length > 0,
    retry: false,
  });

  const onChanged = () => {
    void queryClient.invalidateQueries({ queryKey: taxiOpsQueryKeys.all });
  };

  // Each action answers detail + `outcome`; keep the last one so the page can show what happened.
  const [lastOutcome, setLastOutcome] = useState<{
    action: 'cancel' | 'resolve' | 'release';
    result: AdminTaxiBookingMutationDto;
  } | null>(null);

  const onActionSuccess = (
    action: 'cancel' | 'resolve' | 'release',
    result: AdminTaxiBookingMutationDto,
  ) => {
    setLastOutcome({ action, result });
    queryClient.setQueryData(taxiOpsQueryKeys.booking(bookingId), result);
    onChanged();
  };

  const cancelMutation = useMutation({
    mutationFn: (body: CancelAdminTaxiBookingBody) => submitTaxiBookingCancel(bookingId, body),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast('Booking cancelled.');
      onActionSuccess('cancel', result);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-booking-cancel', toast: false });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (body: { outcome: AdminTaxiDisputeResolution; reason: string }) =>
      submitTaxiDisputeResolve(bookingId, body),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast('Dispute resolved.');
      onActionSuccess('resolve', result);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-dispute-resolve', toast: false });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: () => submitTaxiDepositRelease(bookingId),
    retry: 0,
    onSuccess: (result) => {
      showSuccessToast('Deposit refund submitted to the payment provider.');
      onActionSuccess('release', result);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-deposit-release', toast: false });
    },
  });

  const notDeployed = query.isError && isAdminRouteNotDeployed(query.error);
  return {
    booking: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    cancel: cancelMutation,
    cancelError: cancelMutation.isError ? actionErrorMessage(cancelMutation.error) : null,
    resolve: resolveMutation,
    resolveError: resolveMutation.isError ? actionErrorMessage(resolveMutation.error) : null,
    release: releaseMutation,
    releaseError: releaseMutation.isError ? actionErrorMessage(releaseMutation.error) : null,
    lastOutcome,
    clearLastOutcome: () => {
      setLastOutcome(null);
    },
  };
}

export type TaxiRevenueFilters = {
  kind: AdminTaxiRevenueKind | 'ALL';
  bookingId: string;
  orgId: string;
};

export function useTaxiRevenue(filters: TaxiRevenueFilters) {
  const canRead = useAdminPermission('taxi:read');
  const bookingId = filters.bookingId.trim();
  const orgId = filters.orgId.trim();
  const query = useInfiniteQuery({
    queryKey: taxiOpsQueryKeys.revenue({ kind: filters.kind, bookingId, orgId }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiRevenuePage(
        {
          ...(filters.kind !== 'ALL' ? { kind: filters.kind } : {}),
          ...(bookingId ? { bookingId } : {}),
          ...(orgId ? { orgId } : {}),
          limit: TAXI_OPS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: canRead,
    retry: false,
  });
  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    rows,
    hasMore: query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    loadMore: () => {
      void query.fetchNextPage();
    },
  };
}

const TAXI_OPS_ENROLLMENTS_LIMIT = 200;

export function useTaxiEnrollments() {
  const canRead = useAdminPermission('taxi:read');
  const queryClient = useQueryClient();
  const [status, setStatus] = useUrlFilterState<AdminTaxiEnrollmentStatus | 'ALL'>('status', 'ALL');
  const query = useInfiniteQuery({
    queryKey: taxiOpsQueryKeys.enrollments(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal }) =>
      fetchTaxiEnrollmentsPage(
        {
          ...(status !== 'ALL' ? { status } : {}),
          limit: TAXI_OPS_ENROLLMENTS_LIMIT,
        },
        signal,
      ),
    // The enrollments list is not cursor-paged (OpenAPI: status + limit only).
    getNextPageParam: () => undefined,
    enabled: canRead,
    retry: false,
  });

  const onChanged = () => {
    void queryClient.invalidateQueries({ queryKey: [...taxiOpsQueryKeys.all, 'enrollments'] });
  };

  const suspendMutation = useMutation({
    mutationFn: (input: { orgId: string; reason: string }) =>
      submitTaxiEnrollmentSuspend(input.orgId, input.reason),
    onSuccess: () => {
      showSuccessToast('Taxi enrollment suspended.');
      onChanged();
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-enrollment-suspend', toast: false });
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: (orgId: string) => submitTaxiEnrollmentReinstate(orgId),
    onSuccess: () => {
      showSuccessToast('Taxi enrollment reinstated.');
      onChanged();
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-enrollment-reinstate', toast: false });
    },
  });

  const enrollments = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    ...query,
    enrollments,
    status,
    setStatus,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    suspend: suspendMutation,
    suspendError: suspendMutation.isError ? actionErrorMessage(suspendMutation.error) : null,
    reinstate: reinstateMutation,
    reinstateError: reinstateMutation.isError ? actionErrorMessage(reinstateMutation.error) : null,
  };
}

/** Action errors: say "not deployed" for a missing route, else the server's own reason. */
function actionErrorMessage(error: unknown): string {
  if (isAdminRouteNotDeployed(error)) {
    return 'This action is not available on this server yet.';
  }
  if (error instanceof ApiError) {
    if (error.code === 'taxi_booking_not_resolvable') {
      return 'This booking is not in dispute any more (it may already be resolved). Refresh to see its current state.';
    }
    if (error.code === 'taxi_booking_not_cancellable') {
      return 'This booking can no longer be cancelled from its current status. Refresh to see its state.';
    }
    if (error.code === 'taxi_deposit_not_releasable') {
      return 'The deposit can only be returned while it is held on a completed trip. Refresh to see its state.';
    }
  }
  const mapped = mapAdminApiError(error);
  if (mapped.status === 409 && mapped.message.trim()) {
    return mapped.message;
  }
  return resolveSubmitErrorMessage(error);
}
