'use client';

import { useCallback } from 'react';
import { invalidateDedupeCache } from '@/lib/api/dedupe-cache';
import { clearVehiclePreference } from '@/lib/preferences';
import { signOut } from '@/services/auth';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

/**
 * `POST /v1/auth/logout` (best-effort server revoke), then always clear the local
 * session, cached profile reads, and device-scoped preferences.
 */
export function useLogout(options?: UseApiMutationOptions<void, void>) {
  const fn = useCallback(async () => {
    await signOut();
    invalidateDedupeCache();
    clearVehiclePreference();
  }, []);

  return useApiMutation(fn, {
    successToast: 'Signed out',
    ...options,
  });
}
