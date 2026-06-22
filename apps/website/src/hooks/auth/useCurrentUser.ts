"use client";

import { useCallback, useEffect, useState } from "react";
import { hasAuthTokens, subscribeAuthChange } from "@/lib/auth/storage";
import { fetchCurrentUser } from "@/services/auth";
import type { AuthUser } from "@/services/auth/types";
import { useApiQuery, type UseApiQueryOptions } from "@/hooks/useApiQuery";

/**
 * `GET /v1/auth/me` — returns the signed-in user. Skips automatically when
 * no tokens are stored. Re-runs whenever the auth state changes in this tab
 * (login / logout) or in another tab (via the `storage` event).
 */
export function useCurrentUser(options?: UseApiQueryOptions<AuthUser>) {
  const [authedTick, setAuthedTick] = useState(0);
  const enabled = options?.enabled ?? hasAuthTokens();

  useEffect(() => subscribeAuthChange(() => setAuthedTick((t) => t + 1)), []);

  const fn = useCallback(() => fetchCurrentUser(), []);
  return useApiQuery<AuthUser>(fn, [authedTick], { ...options, enabled });
}
