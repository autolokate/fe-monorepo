"use client";

import { useEffect, useState } from "react";
import { hasAuthTokens, subscribeAuthChange } from "@/lib/auth/storage";

/**
 * Reactive boolean for "do we have tokens?".
 * Re-reads when tokens change in this tab (login / logout / silent refresh)
 * and across tabs (via the `storage` event). Returns `null` until hydrated
 * client-side so SSR markup stays stable.
 */
export function useIsAuthenticated(): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => setAuthed(hasAuthTokens());
    read();
    return subscribeAuthChange(read);
  }, []);

  return authed;
}
