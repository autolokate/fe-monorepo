"use client";

import { useMemo } from "react";
import {
  getProfile,
  updateProfile,
  type Profile,
  type UpdateProfilePayload,
} from "@/services/purchase";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

/** `PATCH /v1/profile` — capture the buyer's profile name (and optionally more). */
export function useUpdatePurchaseProfile(
  options?: UseApiMutationOptions<Profile, UpdateProfilePayload>,
) {
  const fn = useMemo(() => (payload: UpdateProfilePayload) => updateProfile(payload), []);
  return useApiMutation(fn, options);
}

/** `GET /v1/profile` — read the signed-in buyer's profile. Gate with `enabled`. */
export function usePurchaseProfile(enabled = true) {
  return useApiQuery<Profile | null>(
    () => (enabled ? getProfile() : Promise.resolve(null)),
    [enabled],
    { enabled, initialData: null },
  );
}
