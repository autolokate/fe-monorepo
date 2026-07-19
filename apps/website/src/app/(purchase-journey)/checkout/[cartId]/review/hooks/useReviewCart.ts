'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/error';
import { readJourneyState } from '../../../../shared/storage';
import { updateJourneyCart, type Cart } from '../../../../shared/services/checkout-api';

/**
 * `error` = a transient failure, so re-running the same call is a real way
 * forward. `stale` = the cart itself is past its 15-minute TTL or gone, so
 * re-running it can only fail again: the only way forward is a fresh cart.
 */
type Status = 'loading' | 'ready' | 'error' | 'stale';

/** The `code` from the backend's `{ error: { code } }` envelope, when there is one. */
function errorCode(err: unknown): string | undefined {
  if (!(err instanceof ApiError)) return undefined;
  const body = (err.data as { error?: { code?: string } } | undefined)?.error;
  return typeof body?.code === 'string' ? body.code : undefined;
}

/**
 * True when the cart can never be priced again: past its TTL (`cart_expired`
 * 409), or gone from the backend entirely. Everything else is worth retrying.
 */
function isCartUnusable(err: unknown): boolean {
  if (errorCode(err) === 'cart_expired') return true;
  return err instanceof ApiError && (err.status === 404 || err.status === 410);
}

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
 * stays on screen. A refusal that is really the CART dying (`cart_expired`) is
 * never blamed on the code.
 *
 * The cart now survives an abandoned payment (backend D23: it is consumed at
 * capture, not at order-create), so this PATCH keeps working after the payment
 * sheet is dismissed. Only the 15-minute TTL still ends it.
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
      // No plan means the journey state is gone; this cart can never be priced
      // from here, so it is the same dead cart the caller has to escape.
      if (!planId) {
        setStatus('stale');
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
      } catch (err) {
        if (isCartUnusable(err)) {
          // The cart died, not the code: blaming the code would send the buyer
          // hunting for a better one, and no code can revive an expired cart.
          setStatus('stale');
        } else if (isPromo) {
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
