import type {
  AdminBookingSlotInput,
  AdminWebsiteBookingAction,
  AdminWebsiteBookingStatus,
} from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  fetchBookingSlots,
  fetchWebsiteBookingsPage,
  publishBookingSlots,
  transitionWebsiteBooking,
} from '@/services/website-bookings/website-bookings-service';

export const websiteBookingsQueryKeys = {
  all: ['admin', 'website-bookings'] as const,
  slots: (from: string, days: number) =>
    [...websiteBookingsQueryKeys.all, 'slots', { from, days }] as const,
  list: (status: AdminWebsiteBookingStatus | undefined, date: string | undefined) =>
    [...websiteBookingsQueryKeys.all, 'list', { status, date }] as const,
};

/** Inline copy for the booking-ops 409s; other errors use the shared mapper (400 → server text). */
export function describeWebsiteBookingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'booking_slot_in_use') {
      return 'A slot you removed or re-timed still holds a live booking. Cancel that booking first, or keep the slot and mark it closed instead.';
    }
    if (error.code === 'website_booking_invalid_transition') {
      return 'That move isn’t allowed from the booking’s current status (it may have changed meanwhile). Refresh and try again.';
    }
    if (error.status === 400 && error.message.trim()) {
      return error.message;
    }
  }
  return mapAdminApiError(error).userMessage;
}

export function useBookingSlots(from: string, days: number) {
  const query = useQuery({
    queryKey: websiteBookingsQueryKeys.slots(from, days),
    queryFn: ({ signal }) => fetchBookingSlots(from, days, signal),
    retry: (count, error) => !isAdminListNotDeployed(error) && count < 2,
  });
  return {
    slots: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    notDeployed: query.isError && isAdminListNotDeployed(query.error),
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function usePublishBookingSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, slots }: { date: string; slots: AdminBookingSlotInput[] }) =>
      publishBookingSlots(date, slots),
    retry: 0,
    onSuccess: async (_result, variables) => {
      showSuccessToast(
        variables.slots.length === 0
          ? `${variables.date} unpublished.`
          : `${String(variables.slots.length)} slots published for ${variables.date}.`,
      );
      await queryClient.invalidateQueries({ queryKey: websiteBookingsQueryKeys.all });
    },
  });
}

export function useWebsiteBookingsList(
  status: AdminWebsiteBookingStatus | undefined,
  date: string | undefined,
) {
  const query = useInfiniteQuery({
    queryKey: websiteBookingsQueryKeys.list(status, date),
    queryFn: ({ pageParam, signal }) =>
      fetchWebsiteBookingsPage(
        {
          ...(status ? { status } : {}),
          ...(date ? { date } : {}),
          limit: 50,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    retry: (count, error) => !isAdminListNotDeployed(error) && count < 2,
  });
  const bookings = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  return {
    bookings,
    hasMore: query.data?.pages.at(-1)?.pagination?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    notDeployed: query.isError && isAdminListNotDeployed(query.error),
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    loadMore: () => {
      void query.fetchNextPage();
    },
  };
}

export function useTransitionWebsiteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      action,
      reason,
    }: {
      bookingId: string;
      action: AdminWebsiteBookingAction;
      reason?: string;
    }) => transitionWebsiteBooking(bookingId, action, reason),
    retry: 0,
    onSuccess: async (result) => {
      showSuccessToast(`Booking is now ${result.status}.`);
      await queryClient.invalidateQueries({ queryKey: websiteBookingsQueryKeys.all });
    },
  });
}
