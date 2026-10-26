'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPlans, type Plan } from '../services/plans-api';

type Status = 'loading' | 'success' | 'error';

export interface UsePlansResult {
  plans: Plan[];
  isLoading: boolean;
  isError: boolean;
  /** Re-run the fetch (bypasses the cache only when the last attempt failed). */
  retry: () => void;
}

/**
 * Fresh, self-contained plans hook for the purchase journey.
 *
 * Reads through {@link fetchPlans}, which is deduped + TTL-cached, so the API is
 * called at most once across the whole journey. A ref guards against
 * React StrictMode's double-mount and overlapping retries kicking off parallel
 * requests, keeping this to a single in-flight load.
 */
export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus((prev) => (prev === 'success' ? prev : 'loading'));
    try {
      const data = await fetchPlans();
      setPlans(data);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    plans,
    isLoading: status === 'loading',
    isError: status === 'error',
    retry: () => {
      void load();
    },
  };
}
