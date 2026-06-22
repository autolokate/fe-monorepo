"use client";

import { useCallback } from "react";
import { applyApiVehicleCategoryToStorage } from "@/lib/preferences";
import { updateProfile } from "@/services/auth";
import type { AuthUser, UpdateProfilePayload } from "@/services/auth/types";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `PATCH /v1/auth/me` — partial update of the signed-in user's profile.
 *
 * Side-effect: whenever the server returns a new `preferred_vehicle_category`
 * we mirror it into `localStorage.autolokate_vehicle_preference` (or clear
 * the key if the user cleared the field), so the rest of the app sees the
 * change without waiting for the next page load.
 *
 * @example
 *   const { mutate, isLoading } = useUpdateProfile({
 *     onSuccess: (user) => router.replace("/profile"),
 *   });
 *   await mutate({ full_name: "Ada Lovelace", city_id: "blr" });
 */
export function useUpdateProfile(
  options?: UseApiMutationOptions<AuthUser, UpdateProfilePayload>,
) {
  const fn = useCallback(
    async (payload: UpdateProfilePayload): Promise<AuthUser> => {
      const user = await updateProfile(payload);
      // Only reconcile localStorage when the request actually touched the
      // category field — otherwise the server may return the previous value
      // unchanged and we'd needlessly re-write the same key.
      if (Object.prototype.hasOwnProperty.call(payload, "preferred_vehicle_category")) {
        applyApiVehicleCategoryToStorage(user?.preferred_vehicle_category);
      }
      return user;
    },
    [],
  );
  return useApiMutation<AuthUser, UpdateProfilePayload>(fn, {
    successToast: "Profile updated successfully.",
    ...options,
  });
}
