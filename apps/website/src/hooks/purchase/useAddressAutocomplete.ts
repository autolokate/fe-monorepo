'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ADDRESS_MIN_QUERY,
  resolveAddress,
  suggestAddresses,
  type AddressSuggestion,
  type ResolvedAddress,
} from '@/services/purchase';

/** How long the buyer has to pause typing before we hit the vendor. */
const DEBOUNCE_MS = 300;

export interface UseAddressAutocomplete {
  suggestions: AddressSuggestion[];
  isSuggesting: boolean;
  isResolving: boolean;
  /** Feed every keystroke here — debounced, and gated on the min length. */
  search: (query: string) => void;
  /** Resolve a picked prediction; closes the billed session, then drops it. */
  resolve: (placeId: string) => Promise<ResolvedAddress | null>;
  /** Forget the current picker (session + suggestions). The next search mints anew. */
  reset: () => void;
}

/**
 * Owns the full address-picker lifecycle so the UI never has to think about
 * billing. It mints a session on the first keystroke, echoes it on every later
 * one, and closes it on the resolve — then drops it so a fresh picker starts
 * clean. Under `ADDRESS_MIN_QUERY` characters it answers locally, never calling
 * the vendor.
 */
export function useAddressAutocomplete(): UseAddressAutocomplete {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // The live session handle — held across keystrokes, dropped after a resolve.
  const sessionRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every new intent; stale in-flight responses check it and bail so
  // a slow keystroke can't clobber a newer one (or a resolve).
  const seqRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runSuggest = useCallback(async (query: string) => {
    const seq = ++seqRef.current;
    setIsSuggesting(true);
    try {
      // First call carries no session (mint); later calls echo it.
      const res = await suggestAddresses(query, sessionRef.current);
      if (seq !== seqRef.current) return; // superseded — drop the result.
      sessionRef.current = res.session; // hold it for the next keystroke + resolve.
      setSuggestions(res.suggestions);
    } catch {
      if (seq !== seqRef.current) return;
      setSuggestions([]);
    } finally {
      if (seq === seqRef.current) setIsSuggesting(false);
    }
  }, []);

  const search = useCallback(
    (query: string) => {
      const q = query.trim();
      clearTimer();
      if (q.length < ADDRESS_MIN_QUERY) {
        // Answer locally — no vendor call, but keep the session so resuming the
        // same picker still bills as one.
        seqRef.current++; // cancel anything in flight.
        setIsSuggesting(false);
        setSuggestions([]);
        return;
      }
      timerRef.current = setTimeout(() => void runSuggest(q), DEBOUNCE_MS);
    },
    [clearTimer, runSuggest],
  );

  const resolve = useCallback(
    async (placeId: string): Promise<ResolvedAddress | null> => {
      clearTimer();
      seqRef.current++; // cancel any in-flight suggest.
      setIsResolving(true);
      try {
        // Passing the session here CLOSES the billed session.
        const address = await resolveAddress(placeId, sessionRef.current);
        // Drop it — a fresh picker mints a new one.
        sessionRef.current = undefined;
        setSuggestions([]);
        return address;
      } catch {
        return null;
      } finally {
        setIsResolving(false);
      }
    },
    [clearTimer],
  );

  const reset = useCallback(() => {
    clearTimer();
    seqRef.current++;
    sessionRef.current = undefined;
    setSuggestions([]);
    setIsSuggesting(false);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { suggestions, isSuggesting, isResolving, search, resolve, reset };
}
