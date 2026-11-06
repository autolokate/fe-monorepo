import type { AdminNotificationAudience, AdminV4Page } from '@autolokate/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { istDayStartIso } from '@/features/drivequant/driving-status';
import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import {
  fetchUserDevices,
  fetchUserDriverInvites,
  fetchUserDriverScore,
  fetchUserNotifications,
  fetchUserTrips,
  fetchVehicleDriverInvites,
} from '@/services/users/admin-users-v4-service';

export const usersV4QueryKeys = {
  all: ['admin', 'users', 'v4'] as const,
  userInvites: (userId: string) => [...usersV4QueryKeys.all, 'user-invites', userId] as const,
  vehicleInvites: (vehicleId: string) =>
    [...usersV4QueryKeys.all, 'vehicle-invites', vehicleId] as const,
  notifications: (userId: string, audience: string) =>
    [...usersV4QueryKeys.all, 'notifications', userId, audience] as const,
  devices: (userId: string) => [...usersV4QueryKeys.all, 'devices', userId] as const,
  trips: (userId: string, from: string, to: string) =>
    [...usersV4QueryKeys.all, 'trips', userId, from, to] as const,
  driverScore: (userId: string) => [...usersV4QueryKeys.all, 'driver-score', userId] as const,
};

function nextCursor<T>(page: AdminV4Page<T>): string | undefined {
  return page.pagination?.hasMore ? (page.pagination.nextCursor ?? undefined) : undefined;
}

/** Shared shape for keyset lists rendered by the v4 panels. */
function useKeysetList<T>(
  queryKey: readonly unknown[],
  fetchPage: (cursor: string | undefined, signal: AbortSignal) => Promise<AdminV4Page<T>>,
  enabled: boolean,
) {
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    getNextPageParam: nextCursor,
    enabled,
    retry: 0,
  });
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    items,
    isLoading: enabled && query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    refresh: () => {
      void query.refetch();
    },
    notDeployed,
    error: query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    loaded: query.data !== undefined,
  };
}

/** Invites addressed to the account's verified phone or accepted by it (not audited). */
export function useUserDriverInvites(userId: string) {
  return useKeysetList(
    usersV4QueryKeys.userInvites(userId),
    (cursor, signal) => fetchUserDriverInvites(userId, cursor, signal),
    userId.length > 0,
  );
}

/** Invites sent for one vehicle (not audited). */
export function useVehicleDriverInvites(vehicleId: string | null) {
  return useKeysetList(
    usersV4QueryKeys.vehicleInvites(vehicleId ?? ''),
    (cursor, signal) => fetchVehicleDriverInvites(vehicleId ?? '', cursor, signal),
    typeof vehicleId === 'string' && vehicleId.length > 0,
  );
}

/**
 * The account's inbox. Every page read writes a `NOTIFICATION_INBOX_ACCESS` audit row server-side, so
 * nothing is fetched until the operator opts in (`enabled`).
 */
export function useUserNotifications(
  userId: string,
  audience: AdminNotificationAudience | 'ALL',
  enabled: boolean,
) {
  return useKeysetList(
    usersV4QueryKeys.notifications(userId, audience),
    (cursor, signal) =>
      fetchUserNotifications(userId, audience === 'ALL' ? undefined : audience, cursor, signal),
    enabled && userId.length > 0,
  );
}

/** Registered push devices (token suffix only). Loaded with the notifications panel. */
export function useUserDevices(userId: string, enabled: boolean) {
  const query = useQuery({
    queryKey: usersV4QueryKeys.devices(userId),
    queryFn: ({ signal }) => fetchUserDevices(userId, signal),
    enabled: enabled && userId.length > 0,
    retry: 0,
  });
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    devices: query.data ?? [],
    isLoading: enabled && query.isLoading,
    notDeployed,
    error: query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

/** Trips + driver score — both audited (`DRIVER_TRIP_ACCESS`), so gated behind an explicit opt-in. */
export function useUserDriveQuant(
  userId: string,
  range: { from: string; to: string },
  enabled: boolean,
) {
  const trips = useKeysetList(
    usersV4QueryKeys.trips(userId, range.from, range.to),
    (cursor, signal) =>
      fetchUserTrips(
        userId,
        {
          ...(range.from ? { from: istDayStartIso(range.from) } : {}),
          // `to` is exclusive on the server: the day after the picked (inclusive) IST day.
          ...(range.to ? { to: istDayStartIso(range.to, 1) } : {}),
        },
        cursor,
        signal,
      ),
    enabled && userId.length > 0,
  );
  const score = useQuery({
    queryKey: usersV4QueryKeys.driverScore(userId),
    queryFn: ({ signal }) => fetchUserDriverScore(userId, signal),
    enabled: enabled && userId.length > 0,
    retry: 0,
  });
  const scoreNotDeployed = score.isError && isAdminListNotDeployed(score.error);
  return {
    trips,
    score: {
      data: score.data ?? null,
      isLoading: enabled && score.isLoading,
      notDeployed: scoreNotDeployed,
      error: score.isError && !scoreNotDeployed ? mapAdminApiError(score.error).userMessage : null,
      refresh: () => {
        void score.refetch();
      },
    },
  };
}
