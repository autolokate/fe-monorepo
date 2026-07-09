import { useCallback, useEffect, useState } from 'react';
import { getTokenManager } from '@autolokate/auth';

import {
  refreshDeviceRegistration,
  registerDevice,
} from '@/services/device/device-service';

/**
 * Headless device registration — no UI.
 * On mount, registers when an auth session already exists (session restore).
 */
export function useRegisterDevice() {
  const [isPending, setIsPending] = useState(false);

  const register = useCallback(async () => {
    setIsPending(true);
    try {
      await registerDevice();
      return { ok: true as const };
    } finally {
      setIsPending(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsPending(true);
    try {
      await refreshDeviceRegistration();
      return { ok: true as const };
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    if (!getTokenManager().hasSession()) {
      return;
    }
    void registerDevice();
  }, []);

  return { register, refresh, isPending };
}
