"use client";

import { useEffect, useRef } from "react";
import { hasAuthTokens, subscribeAuthChange } from "@/lib/auth/storage";
import {
  applyApiVehicleCategoryToStorage,
  clearVehiclePreference,
} from "@/lib/preferences";
import { fetchCurrentUser } from "@/services/auth";

/**
 * Side-effect hook that keeps `localStorage.autolokate_vehicle_preference` in
 * lock-step with the signed-in user's `preferred_vehicle_category`:
 *
 *  - On login (auth tokens present) → fetch `/v1/auth/me` and apply the
 *    mapped category. Creates the key if missing, updates if different.
 *  - On logout (auth tokens disappear) → clear the local preference so the
 *    next visitor on this device starts fresh.
 *  - On cross-tab token changes (storage event) → re-runs both branches.
 *
 * Logout detection is transition-based — we only clear when auth goes from
 * `true → false`. A page first painted in a logged-out state keeps whatever
 * the visitor had previously picked via the popup.
 */
export function useSyncVehiclePreferenceFromProfile(): void {
  const inflightRef = useRef<Promise<void> | null>(null);
  const wasAuthedRef = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const authed = hasAuthTokens();
      const wasAuthed = wasAuthedRef.current;
      wasAuthedRef.current = authed;

      if (!authed) {
        // Only clear on an actual logout transition. First paint while
        // logged out (wasAuthed === null) is intentionally left alone so
        // a previously-chosen popup value survives reloads.
        if (wasAuthed === true) clearVehiclePreference();
        return;
      }

      if (inflightRef.current) return;

      const task = (async () => {
        try {
          const user = await fetchCurrentUser();
          if (cancelled) return;
          applyApiVehicleCategoryToStorage(user?.preferred_vehicle_category);
        } catch {
          // Best-effort sync — failures are swallowed so a hiccup on
          // /v1/auth/me never bubbles up as a user-visible error. The next
          // auth-change event will retry.
        }
      })();

      inflightRef.current = task;
      try {
        await task;
      } finally {
        inflightRef.current = null;
      }
    };

    void sync();
    const unsubscribe = subscribeAuthChange(() => void sync());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);
}
