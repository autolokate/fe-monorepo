'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readJourneyState } from '../../../../shared/storage';
import { updateJourneyCart, type Cart } from '../../../../shared/services/checkout-api';

type Status = 'loading' | 'ready' | 'error';

/** Promo field state: nothing applied, a valid code applied, or the last try was rejected. */
export type PromoState = 'idle' | 'applied' | 'invalid';

export interface UseReviewCartResult {
  cart: Cart | null;
  status: Status;
  /** Plan id backing the cart (from journey storage). `undefined` → can't re-price. */
  planId?: string;
  riderCount: number;
  /** A promo apply/remove is in flight (keeps the summary visible, unlike a full reload). */
  applyingPromo: boolean;
  promoState: PromoState;
  /** The code currently applied by the backend, if any. */
  appliedCode: string;
  /** Re-run the initial pricing (used by the error state's "Try again"). */
  reload: () => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
}

/**
 * Owns the review step's cart pricing. There's no `GET /v1/cart`, so we re-price
 * the existing cart with `PATCH /v1/cart/:id` — once on mount (the page "load"),
 * and again whenever a promo is applied or cleared. All money comes back on the
 * {@link Cart} in paise.
 *
 * Promo validity mirrors the old flow: a code is "applied" only when the backend
 * echoes it with a real discount; a submitted code that comes back without one
 * (or a hard API error) is surfaced as "invalid" while the last good pricing
 * stays on screen.
 */
export function useReviewCart(cartId: string): UseReviewCartResult {
  const snapshot = useRef(readJourneyState());
  const planId = snapshot.current.planId;
  const riderCount = snapshot.current.riderCount ?? 0;

  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoState, setPromoState] = useState<PromoState>('idle');

  const busyRef = useRef(false);
  const bootedRef = useRef(false);

  const price = useCallback(
    // `null` = remove an applied promo (PATCH sends `promoCode: null`);
    // `''` = re-price without touching the promo (load / reload);
    // non-empty = apply that code.
    async (promoCode: string | null, isPromo: boolean) => {
      if (!planId) {
        setStatus('error');
        return;
      }
      if (busyRef.current) return;
      busyRef.current = true;
      if (isPromo) setApplyingPromo(true);
      else setStatus('loading');

      try {
        const next = await updateJourneyCart({
          cartId,
          planId,
          riderCount,
          promoCode: promoCode === '' ? undefined : promoCode,
        });
        setCart(next);
        setStatus('ready');

        const applied = Boolean(next.appliedPromoCode) && next.discountPaise > 0;
        if (isPromo) {
          setPromoState(promoCode ? (applied ? 'applied' : 'invalid') : 'idle');
        } else {
          setPromoState(applied ? 'applied' : 'idle');
        }
      } catch {
        if (isPromo) {
          // Keep the last good pricing on screen; just flag the code.
          setPromoState(promoCode ? 'invalid' : 'idle');
        } else {
          setStatus('error');
        }
      } finally {
        busyRef.current = false;
        setApplyingPromo(false);
      }
    },
    [cartId, planId, riderCount],
  );

  // Initial price-load, guarded against React StrictMode's double-mount.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    void price('', false);
  }, [price]);

  return {
    cart,
    status,
    planId,
    riderCount,
    applyingPromo,
    promoState,
    appliedCode: cart?.appliedPromoCode ?? '',
    reload: () => void price('', false),
    applyPromo: (code: string) => void price(code.trim(), true),
    removePromo: () => void price(null, true),
  };
}
