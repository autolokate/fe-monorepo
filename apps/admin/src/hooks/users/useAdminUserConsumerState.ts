import type { AdminUserEntitlementsDto, AdminUserStreakDto } from '@autolokate/api-client';
import { useQuery } from '@tanstack/react-query';

import { isAdminRouteNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchUserEntitlements, fetchUserStreak } from '@/services/users/admin-users-service';

export type AdminReadState<T> = {
  data: T | null;
  isLoading: boolean;
  /** The backend route answers `Cannot GET …` on this environment. */
  notDeployed: boolean;
  error: string | null;
};

function toState<T>(query: {
  data: T | undefined;
  isLoading: boolean;
  error: unknown;
}): AdminReadState<T> {
  const notDeployed = isAdminRouteNotDeployed(query.error);
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    notDeployed,
    error: query.error && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
  };
}

/**
 * Consumer v2 state for one account — entitlement snapshot (plan, premium flags, per-vehicle role) and
 * streak. Both are server-authoritative reads; nothing here is derived on the client.
 */
export function useAdminUserConsumerState(userId: string | null) {
  const enabled = typeof userId === 'string' && userId.length > 0;

  const entitlementsQuery = useQuery({
    queryKey: ['admin', 'users', 'entitlements', userId],
    queryFn: ({ signal }) => {
      if (!userId) throw new Error('userId required');
      return fetchUserEntitlements(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const streakQuery = useQuery({
    queryKey: ['admin', 'users', 'streak', userId],
    queryFn: ({ signal }) => {
      if (!userId) throw new Error('userId required');
      return fetchUserStreak(userId, signal);
    },
    enabled,
    retry: 0,
  });

  return {
    entitlements: toState<AdminUserEntitlementsDto>(entitlementsQuery),
    streak: toState<AdminUserStreakDto>(streakQuery),
    isFetching: entitlementsQuery.isFetching || streakQuery.isFetching,
    refresh: () => {
      void entitlementsQuery.refetch();
      void streakQuery.refetch();
    },
  };
}
