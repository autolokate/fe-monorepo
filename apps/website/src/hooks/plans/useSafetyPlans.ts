'use client';

import { useEffect, useState } from 'react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { hasSession } from '@/lib/session';
import { getPlans } from '@/services/plans';

/**
 * Reactive list of protection plans for marketing surfaces. `GET /v1/plans` is
 * bearer-only on the backend, so anonymous visitors skip the call (callers render
 * their static fallback tiers) instead of firing a guaranteed 401.
 */
export function useSafetyPlans() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(hasSession());
  }, []);
  return useApiQuery(() => getPlans(), [authed], { initialData: [], enabled: authed });
}
