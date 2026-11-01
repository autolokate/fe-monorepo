'use client';

import { useCallback, useEffect, useState } from 'react';
import { subscribeSession } from '@/lib/session';
import { fetchProfile, type Profile } from '@/services/auth';
import { useApiQuery, type UseApiQueryOptions } from '@/hooks/useApiQuery';

/**
 * `GET /v1/profiles` for the signed-in account. Gate with `enabled` (usually
 * `useIsAuthenticated() === true`); re-runs after sign-in / sign-out in this tab.
 */
export function useProfile(options?: UseApiQueryOptions<Profile>) {
  const [tick, setTick] = useState(0);
  useEffect(
    () =>
      subscribeSession(() => {
        setTick((t) => t + 1);
      }),
    [],
  );
  const fn = useCallback(() => fetchProfile(), []);
  return useApiQuery<Profile>(fn, [tick], { ...options, enabled: options?.enabled ?? false });
}
