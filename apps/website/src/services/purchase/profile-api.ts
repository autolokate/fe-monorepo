'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/error';
import { PurchaseApi } from './client';

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

function unwrapProfile(payload: unknown): Profile | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Enveloped<Profile> & Partial<Profile>;
  const nested = root.data && typeof root.data === 'object' ? root.data : null;
  const source = nested ?? root;

  // `name` may be null for brand-new accounts — still a valid profile shell.
  if (!('name' in source) && !('locale' in source) && !('photoMediaId' in source)) {
    return null;
  }

  return {
    name: typeof source.name === 'string' ? source.name : '',
    locale: source.locale ?? null,
    photoMediaId: source.photoMediaId ?? null,
  };
}

/** PATCH /v1/profile — capture / update the buyer's profile (bearer). */
export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const body: UpdateProfilePayload = {};
  if (payload.name?.trim()) body.name = payload.name.trim();
  if (payload.locale?.trim()) body.locale = payload.locale.trim();
  if (payload.photoMediaId?.trim()) body.photoMediaId = payload.photoMediaId.trim();

  const res = await PurchaseApi.patch<Enveloped<Profile> & Partial<Profile>>(
    endpoints.profile,
    body,
  );
  const profile = unwrapProfile(res.data);
  if (!profile) {
    throw new ApiError('We couldn’t save your profile. Please try again.', 0, res.data);
  }
  return profile;
}

/** GET /v1/profile — read the buyer's profile back (bearer). */
export async function getProfile(): Promise<Profile> {
  const res = await PurchaseApi.get<Enveloped<Profile> & Partial<Profile>>(endpoints.profile);
  const profile = unwrapProfile(res.data);
  if (!profile) {
    throw new ApiError('We couldn’t load your profile. Please try again.', 0, res.data);
  }
  return profile;
}
