'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, Lock } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/error';
import { useSafetyPlans } from '@/hooks/plans';
import { useCreateCart, useCreateOrder, usePayOrder, useUpdateCart } from '@/hooks/purchase';
import { openRazorpayCheckout } from '@/lib/payments/razorpay';
import type { Cart } from '@/services/purchase';
import { PLAN_ID_TO_TIER, paiseToInr } from '../../constants';
import type { StepProps } from '../../types';
import styles from './index.module.css';

/** The cart id we hold is unusable for good: consumed at order-create, or expired. */
function isCartGone(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 404 || err.status === 410);
}

export function SummaryStep({ state, plan, update, goTo }: StepProps) {
  const shipCity = state.city.trim() || 'your city';

  const { data: plans } = useSafetyPlans();
  const apiPlan = (plans ?? []).find((p) => p.tier === PLAN_ID_TO_TIER[state.planId]);
  const planId = apiPlan?.id ?? null;
  const planName = apiPlan?.name ?? plan.name;

  const { mutateAsync: createCart } = useCreateCart({ errorToast: true });
  // Silent on failure: a gone cart self-heals below, and a genuine failure is
  // surfaced by the error card rather than a second toast stacked on top of it.
  const { mutateAsync: updateCart } = useUpdateCart({ errorToast: false });
  const { mutateAsync: createOrder } = useCreateOrder({ errorToast: true });
  const { mutateAsync: payOrder } = usePayOrder({ errorToast: true });

  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(false);
  const [promoInput, setPromoInput] = useState(state.promo);
  const [appliedPromo, setAppliedPromo] = useState(state.promo);
  const [submitting, setSubmitting] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  // The live cart id — POST mints it once, every re-price after that PATCHes it.
  // A ref (not just state) so back-to-back calls see the latest id synchronously.
  const cartIdRef = useRef<string | null>(state.cartId);
  // Collapses duplicate in-flight re-prices (incl. StrictMode's double effect).
  const pricingKeyRef = useRef<string>('');
  const pricingBusyRef = useRef(false);
  // An unpaid order already created for the cart exactly as priced right now.
  // Order creation is NOT idempotent per cart and a retail order has no backend
  // duplicate guard, so a dismissed sheet must resume this order rather than
  // mint a second one. INVALIDATION RULE: cleared on every successful re-price,
  // because the backend pins totals on the order at create and charges the
  // ORDER, so resuming after a promo or tier change would charge the old total.
  const pendingOrderIdRef = useRef<string | null>(null);

  // Price the cart whenever the plan, quantity, or applied promo changes. All
  // money shown on this screen comes straight from this cart response. The first
  // call creates the cart (POST); every later call re-prices it in place (PATCH).
  const priceCart = useCallback(
    async (promoCode: string) => {
      if (!planId) return;
      const key = `${planId}|${String(state.qty)}|${promoCode}`;
      // Skip a duplicate request for the same inputs already in flight.
      if (pricingBusyRef.current && pricingKeyRef.current === key) return;
      pricingKeyRef.current = key;
      pricingBusyRef.current = true;
      setCartLoading(true);
      setCartError(false);
      try {
        const priced = { planId, riderCount: state.qty, promoCode: promoCode || undefined };
        const existingId = cartIdRef.current;
        let next: Cart;
        if (existingId) {
          try {
            next = await updateCart({ cartId: existingId, ...priced });
          } catch (err) {
            // The backend consumes the cart at order-create, so after a
            // dismissed sheet this id can never be re-priced again. Mint a
            // fresh cart on the same plan / riders / promo instead of stranding
            // the buyer on an error card whose "Try again" re-PATCHes the same
            // dead id forever. Only a gone cart self-heals; a 5xx or a dropped
            // connection still surfaces. One create-fallback per call, so this
            // cannot loop.
            if (!isCartGone(err)) throw err;
            cartIdRef.current = null;
            next = await createCart(priced);
          }
        } else {
          next = await createCart(priced);
        }
        cartIdRef.current = next.cartId;
        setCart(next);
        // Re-priced, so any order pinned to the previous totals is stale.
        pendingOrderIdRef.current = null;
        setPaymentCancelled(false);
        update({ cartId: next.cartId, promo: next.appliedPromoCode ?? '' });
      } catch {
        setCart(null);
        setCartError(true);
      } finally {
        pricingBusyRef.current = false;
        setCartLoading(false);
      }
    },
    [planId, state.qty, createCart, updateCart, update],
  );

  useEffect(() => {
    void priceCart(appliedPromo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, state.qty, appliedPromo]);

  const applyPromo = () => {
    setAppliedPromo(promoInput.trim());
  };
  const clearPromo = () => {
    setPromoInput('');
    setAppliedPromo('');
  };

  const handlePay = async () => {
    if (!cart) return;
    if (!state.addressId) {
      toast.error('Please choose a delivery address.');
      goTo('address');
      return;
    }
    setSubmitting(true);
    setPaymentCancelled(false);
    try {
      // Resume the order we already hold for this cart instead of creating a
      // second one. Re-paying a still-unpaid order is safe: the backend returns
      // the same live payment ref, so nothing is charged twice and no duplicate
      // order number or fulfillment row is minted.
      let orderId = pendingOrderIdRef.current;
      if (!orderId) {
        const order = await createOrder({ cartId: cart.cartId, addressId: state.addressId });
        orderId = order.orderId;
        pendingOrderIdRef.current = orderId;
      }
      update({ orderId });

      const ref = await payOrder({
        orderId,
        payload: { setupMandate: state.autoRenew, mandateConsent: state.autoRenew },
      });

      // Missing credentials resolve to `unavailable` inside the helper, so a pay
      // response without Razorpay handles can no longer fall through to success.
      const result = await openRazorpayCheckout({
        keyId: ref.razorpayKeyId ?? '',
        orderId: ref.providerOrderId ?? '',
        amountPaise: cart.totalPaise,
        name: 'Autolokate',
        description: `${String(state.qty)} × ${planName} plan`,
        prefill: { name: state.name, contact: state.mobile },
      });

      if (result.status === 'paid') {
        pendingOrderIdRef.current = null;
        goTo('success');
        return;
      }
      if (result.status === 'dismissed') {
        // The order is still unpaid, so keep it and stay put: pressing Pay
        // again resumes this same order rather than creating another.
        setPaymentCancelled(true);
        toast.message('Payment cancelled. Nothing was charged, and your order is still waiting.');
        return;
      }
      toast.error('We could not open the payment window. Check your connection and try again.');
    } catch (err) {
      // An order the backend no longer knows about can never be paid, so drop
      // it and let the next attempt create a fresh one. Every other failure
      // keeps the pin, so a transient error cannot mint a duplicate order.
      if (err instanceof ApiError && err.status === 404) pendingOrderIdRef.current = null;
      // Error toast is surfaced by the mutation hooks.
    } finally {
      setSubmitting(false);
    }
  };

  const totalLabel = cart ? `₹${paiseToInr(cart.totalPaise)}` : '—';
  const payDisabled = !cart || cartLoading || submitting;

  return (
    <>
      <h1 className={cn(styles.title, 'font-display')}>Review &amp; pay</h1>
      <div className={styles.layout}>
        <div className={styles.col}>
          {paymentCancelled ? (
            <div className={styles.noticeCard} role="status">
              <p className={styles.noticeText}>
                Payment cancelled. Nothing was charged, and your order is still waiting. Press Pay
                when you&apos;re ready to finish it.
              </p>
            </div>
          ) : null}

          {cartError && !cart ? (
            <div className={styles.errorCard} role="alert">
              <p className={styles.errorText}>
                Something went wrong loading your order. Please try again.
              </p>
              <button
                type="button"
                className={styles.retry}
                onClick={() => {
                  void priceCart(appliedPromo);
                }}
                disabled={cartLoading}
              >
                {cartLoading ? 'Retrying…' : 'Try again'}
              </button>
            </div>
          ) : null}

          <div className={styles.card}>
            <div className={styles.lineTop}>
              <b>
                {state.qty} × {planName} plan
              </b>
              <span className={styles.lineAmount}>
                {cart ? `₹${paiseToInr(cart.subtotalPaise)}` : '—'}
              </span>
            </div>
            <p className={styles.lineNote}>
              1-year cover · smart QR kit per vehicle · ships to {shipCity}
            </p>

            {cart && cart.discountPaise > 0 ? (
              <div className={styles.discountRow}>
                <span>Discount{cart.appliedPromoCode ? ` (${cart.appliedPromoCode})` : ''}</span>
                <span>−₹{paiseToInr(cart.discountPaise)}</span>
              </div>
            ) : null}

            <div className={styles.metaRow}>
              <span>GST (18%, included) · invoice emailed</span>
              <span>{cart ? `₹${paiseToInr(cart.gstPaise)}` : '—'}</span>
            </div>
            <div className={styles.metaRow}>
              <span>Shipping (Shiprocket, 3–5 days)</span>
              <span className={styles.free}>FREE</span>
            </div>

            <div className={styles.totalRow}>
              <b>Total today</b>
              <span className={styles.totalAmount}>
                {cartLoading && !cart ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  totalLabel
                )}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.payLabel}>Have a promo code?</p>
            <div className={styles.promoRow}>
              <input
                className={styles.promoInput}
                placeholder="e.g. FRIEND50"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                }}
                aria-label="Promo code"
              />
              {cart?.appliedPromoCode ? (
                <button type="button" className={styles.promoClear} onClick={clearPromo}>
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.promoApply}
                  onClick={applyPromo}
                  disabled={!promoInput.trim() || cartLoading}
                >
                  Apply
                </button>
              )}
            </div>
            {cart?.appliedPromoCode ? (
              <p className={styles.promoOk}>
                <Check className="h-3.5 w-3.5" aria-hidden /> {cart.appliedPromoCode} applied
              </p>
            ) : null}
          </div>
        </div>

        <aside className={styles.rail}>
          <div className={styles.payPanel}>
            <p className={styles.payingLabel}>You&apos;re paying</p>
            <p className={styles.payingAmount}>{totalLabel}</p>

            <button
              type="button"
              className={cn(styles.renew, state.autoRenew && styles.renewOn)}
              onClick={() => {
                update({ autoRenew: !state.autoRenew });
              }}
              aria-pressed={state.autoRenew}
            >
              <span className={cn(styles.check, state.autoRenew && styles.checkOn)} aria-hidden>
                {state.autoRenew ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
              </span>
              <span>
                <span className={styles.renewTitle}>
                  Auto-renew next year &amp; lock this price
                </span>
                <span className={styles.renewDesc}>
                  Your protection stays active without interruption. We&apos;ll remind you 7 days
                  before renewal, and you can cancel anytime.
                </span>
              </span>
            </button>

            <AlButton
              size="lg"
              radius="lg"
              variant="primary"
              className={styles.payBtn}
              disabled={payDisabled}
              onClick={() => {
                void handlePay();
              }}
            >
              {submitting ? 'Processing…' : `Pay ${totalLabel}`}
            </AlButton>
            <p className={styles.payFine}>
              <Lock className="mr-1 inline h-3 w-3" aria-hidden />
              256-bit secure payments · Pay via UPI, cards, or net banking · GST invoice included ·
              7-day replacement for damaged kits
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
