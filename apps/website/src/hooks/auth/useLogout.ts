"use client";

import { useCallback } from "react";
import { clearAuthTokens } from "@/lib/auth/storage";
import { clearVehiclePreference } from "@/lib/preferences";
import { logoutUser } from "@/services/auth";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `POST /v1/auth/logout` — best-effort server revoke, always clears local
 * state. Even if the server call fails, the user is logged out locally and
 * any device-scoped preferences (vehicle category, etc.) are wiped so the
 * next visitor on this browser starts from a clean slate.
 */
export function useLogout(options?: UseApiMutationOptions<void, void>) {
  const fn = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Local logout still proceeds if backend revoke fails.
    }
    clearAuthTokens();
    clearVehiclePreference();
  }, []);

  return useApiMutation<void, void>(fn, {
    successToast: "Signed out",
    ...options,
  });
}
