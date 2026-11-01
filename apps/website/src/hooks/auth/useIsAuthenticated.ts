'use client';

import { useEffect, useState } from 'react';
import { hasSession, subscribeSession } from '@/lib/session';

/**
 * Reactive "is there a website session in this tab?". Returns `null` until hydrated on
 * the client (sessionStorage is not visible to SSR), so server markup stays stable and
 * guards can show a skeleton instead of flashing the signed-out state.
 */
export function useIsAuthenticated(): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => {
      setAuthed(hasSession());
    };
    read();
    return subscribeSession(read);
  }, []);

  return authed;
}
