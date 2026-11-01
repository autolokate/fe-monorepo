'use client';

import { useMemo } from 'react';
import { updateProfile, type Profile, type UpdateProfilePayload } from '@/services/auth';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

/** `PATCH /v1/profile`. */
export function useUpdateProfile(options?: UseApiMutationOptions<Profile, UpdateProfilePayload>) {
  const fn = useMemo(() => (payload: UpdateProfilePayload) => updateProfile(payload), []);
  return useApiMutation<Profile, UpdateProfilePayload>(fn, {
    successToast: 'Profile updated successfully.',
    ...options,
  });
}
