"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/error";
import { PurchaseApi } from "./client";

export interface Profile {
  name: string;
  locale?: string | null;
  photoMediaId?: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  locale?: string;
  photoMediaId?: string;
}

interface Enveloped<T> {
  data?: T;
}

/** PATCH /v1/profile — capture / update the buyer's profile (bearer). */
export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const body: UpdateProfilePayload = {};
  if (payload.name?.trim()) body.name = payload.name.trim();
  if (payload.locale?.trim()) body.locale = payload.locale.trim();
  if (payload.photoMediaId?.trim()) body.photoMediaId = payload.photoMediaId.trim();

  const res = await PurchaseApi.patch<Enveloped<Profile>>(endpoints.profile, body);
  const profile = res.data?.data;
  if (!profile) throw new ApiError("Invalid profile response", 0, res.data);
  return profile;
}

/** GET /v1/profile — read the buyer's profile back (bearer). */
export async function getProfile(): Promise<Profile> {
  const res = await PurchaseApi.get<Enveloped<Profile>>(endpoints.profile);
  const profile = res.data?.data;
  if (!profile) throw new ApiError("Invalid profile response", 0, res.data);
  return profile;
}
