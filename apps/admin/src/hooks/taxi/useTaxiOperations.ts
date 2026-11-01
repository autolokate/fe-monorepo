import type { AdminTaxiBookingStatus, AdminTaxiEnrollmentStatus } from '@autolokate/api-client';
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
  submitTaxiEnrollmentReinstate,
  submitTaxiEnrollmentSuspend,
} from '@/services/taxi/taxi-operations-service';

export const TAXI_OPS_PAGE_LIMIT = 25;

export const taxiOpsQueryKeys = {
  all: ['admin', 'taxi', 'ops'] as const,
  bookings: (status: string) => [...taxiOpsQueryKeys.all, 'bookings', status] as const,
  booking: (id: string) => [...taxiOpsQueryKeys.all, 'booking', id] as const,
  enrollments: (status: string) => [...taxiOpsQueryKeys.all, 'enrollments', status] as const,
};

export function useTaxiBookings() {
  const canRead = useAdminPermission('taxi:read');
  const [status, setStatus] = useState<AdminTaxiBookingStatus | 'ALL'>('ALL');
  const query = useInfiniteQuery({
    queryKey: taxiOpsQueryKeys.bookings(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiBookingsPage(
        {
          ...(status !== 'ALL' ? { status } : {}),
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

  const cancelMutation = useMutation({
    mutationFn: (input: { reason: string; refundAdvance: boolean; idempotencyKey: string }) =>
      submitTaxiBookingCancel(
        bookingId,
        { reason: input.reason, refundAdvance: input.refundAdvance },
        input.idempotencyKey,
      ),
    onSuccess: () => {
      showSuccessToast('Booking cancelled.');
      onChanged();
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'taxi-booking-cancel', toast: false });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (idempotencyKey: string) => submitTaxiDepositRelease(bookingId, idempotencyKey),
    onSuccess: () => {
      showSuccessToast('Deposit release requested.');
      onChanged();
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
    release: releaseMutation,
    releaseError: releaseMutation.isError ? actionErrorMessage(releaseMutation.error) : null,
  };
}

export function useTaxiEnrollments() {
  const canRead = useAdminPermission('taxi:read');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AdminTaxiEnrollmentStatus | 'ALL'>('ALL');
  const query = useInfiniteQuery({
    queryKey: taxiOpsQueryKeys.enrollments(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchTaxiEnrollmentsPage(
        {
          ...(status !== 'ALL' ? { status } : {}),
          limit: TAXI_OPS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
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
  const mapped = mapAdminApiError(error);
  if (mapped.status === 409 && mapped.message.trim()) {
    return mapped.message;
  }
  return resolveSubmitErrorMessage(error);
}
