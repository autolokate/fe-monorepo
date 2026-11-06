import { useQuery } from '@tanstack/react-query';

import { dqErrorView, type DqErrorView } from '@/features/drivequant/dq-errors';
import { isAdminListNotDeployed } from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { fetchSosCrashTelemetry } from '@/services/sos/sos-service';
import { fetchUserCrashes, fetchUserTripDetail } from '@/services/users/admin-users-v4-service';

export const driveQuantQueryKeys = {
  all: ['admin', 'drivequant'] as const,
  trip: (userId: string, tripId: string) =>
    [...driveQuantQueryKeys.all, 'trip', userId, tripId] as const,
  crashes: (userId: string) => [...driveQuantQueryKeys.all, 'crashes', userId] as const,
  sosCrash: (incidentId: string) => [...driveQuantQueryKeys.all, 'sos-crash', incidentId] as const,
};

/**
 * Every read here is an audited PII read served `no-store`, so the client keeps it only while the
 * view is open: the data leaves memory ~1 s after the view unmounts (the short window absorbs a
 * React StrictMode / re-render remount without a second audited read), it is never re-fetched on
 * mount / focus / reconnect / interval, and failures are not retried — each read writes an audit row.
 * Only an explicit Retry calls the server again.
 */
const NO_CACHE = {
  gcTime: 1_000,
  staleTime: Number.POSITIVE_INFINITY,
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export type DqReadState<T> = {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  /** 404 on a server that predates the route (only for routes that may be absent). */
  notDeployed: boolean;
  error: DqErrorView | null;
  refetch: () => void;
};

function toState<T>(
  query: {
    data: T | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
  },
  enabled: boolean,
  notDeployedOn404: boolean,
  notFoundMessage: string,
): DqReadState<T> {
  const notDeployed = notDeployedOn404 && query.isError && isAdminListNotDeployed(query.error);
  return {
    data: query.data ?? null,
    isLoading: enabled && query.isLoading,
    isFetching: query.isFetching,
    notDeployed,
    error: query.isError && !notDeployed ? dqErrorView(query.error, notFoundMessage) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

/** One trip with every DriveQuant metric + event (audited `DRIVER_TRIP_ACCESS`). */
export function useUserTripDetail(userId: string, tripId: string | null) {
  const enabled = userId.length > 0 && tripId !== null;
  const query = useQuery({
    queryKey: driveQuantQueryKeys.trip(userId, tripId ?? 'none'),
    queryFn: ({ signal }) => fetchUserTripDetail(userId, tripId ?? '', signal),
    enabled,
    ...NO_CACHE,
  });
  return toState(query, enabled, false, 'This trip was not found (it may have been deleted).');
}

/** The account's DriveQuant crashes (no location). Loads with the other audited Driving reads. */
export function useUserCrashes(userId: string, enabled: boolean) {
  const on = enabled && userId.length > 0;
  const query = useQuery({
    queryKey: driveQuantQueryKeys.crashes(userId),
    queryFn: ({ signal }) => fetchUserCrashes(userId, signal),
    enabled: on,
    ...NO_CACHE,
  });
  return toState(query, on, true, 'Crashes are not available on this server yet.');
}

/** Decrypted crash telemetry of an SOS incident (audited `INCIDENT_PII_ACCESS`). Read once per open. */
export function useSosCrashTelemetry(incidentId: string, enabled: boolean) {
  const canView = useAdminPermission('sos:view');
  const on = canView && enabled && incidentId.length > 0;
  const query = useQuery({
    queryKey: driveQuantQueryKeys.sosCrash(incidentId),
    queryFn: ({ signal }) => fetchSosCrashTelemetry(incidentId, signal),
    enabled: on,
    ...NO_CACHE,
  });
  return toState(query, on, true, 'Crash telemetry is not available on this server yet.');
}
