import { useCallback, useState } from 'react';

import { logout } from '@/services/auth/auth-service.js';

export function useLogout() {
  const [isPending, setIsPending] = useState(false);

  const performLogout = useCallback(async () => {
    setIsPending(true);
    try {
      await logout();
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { logout: performLogout, isPending };
}
