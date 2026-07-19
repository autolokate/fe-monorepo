'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  RotateCw,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { listAddresses, type SavedAddress } from '@/services/purchase';
import { ApiError } from '@/lib/api/error';

import { openRazorpayCheckout, type RazorpayResult } from '@/lib/payments/razorpay';
import { JourneyHeader } from '../../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../../shared/components/JourneyProgress';
import { JourneyError } from '../../../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../../../shared/routes';
import { patchJourneyState, readJourneyState } from '../../../../../shared/storage';
import { usePlans } from '../../../../../shared/hooks/usePlans';
import { formatRupees } from '../../../../../shared/plans';
import {
  createJourneyOrder,
  getJourneyPaymentOutcome,
  getSessionMobile,
  isPurchaseAuthenticated,
  payJourneyOrder,
} from '../../../../../shared/services/checkout-api';
import { getJourneyProfile } from '../../../../../shared/services/auth-api';
import { useReviewCart } from '../../hooks/useReviewCart';
import { OrderSummaryCard } from '../OrderSummaryCard';
import { PromoField } from '../PromoField';
import { ReviewSkeleton } from '../ReviewSkeleton';
import styles from './index.module.css';

interface ReviewViewProps {
  /** Cart minted after verify — keys this route and drives all pricing. */
  cartId: string;
}

/**
 * `cancelled` = the sheet closed without a charge (buyer backed out, or the
 * card was declined) and the unpaid order is still resumable. `failed` = we
 * could not get a payment started at all.
 */
type PayPhase = 'idle' | 'processing' | 'cancelled' | 'failed';

interface Purchase {
  planId?: string;
  riderCount: number;
  /** Address CONTENT, not its id. See {@link addressStamp}. */
  addressStamp: string;
  totalPaise: number;
  promoCode: string;
}

/**
 * Everything that determines what the buyer is charged AND where it ships. An unpaid order stays
 * resumable only while this is unchanged, because the backend charges the total pinned on the ORDER
 * at create time, never the cart's current total.
 */
function purchaseFingerprint(p: Purchase): string {
  return [p.planId ?? '', p.riderCount, p.addressStamp, p.totalPaise, p.promoCode].join('|');
}

/**
 * The delivery address reduced to its CONTENT.
 *
 * Keying on `addressId` alone was a mis-ship: order-create SNAPSHOTS the address into the
 * fulfilment row, so editing that same address afterwards left the id matching while the parcel
 * would still go to the pre-edit destination. The address is not part of the cart either, so the
 * backend's price-based supersede cannot see the change. This is the only guard.
 */
function addressStamp(a: SavedAddress): string {
  return [a.name, a.phone, a.email ?? '', a.line1, a.line2 ?? '', a.city, a.state, a.pincode].join(
    '~',
  );
}

export function ReviewView({ cartId }: ReviewViewProps) {
  const router = useRouter();

  // Checkout is post-verify: bounce anyone without a live session back to plans.
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (isPurchaseAuthenticated()) {
      setAuthed(true);
    } else {
      setAuthed(false);
      router.replace(JOURNEY_ROUTES.buy);
    }
  }, [router]);

  const {
    cart,
    status,
    planId,
    riderCount,
    applyingPromo,
    promoState,
    appliedCode,
    reload,
    applyPromo,
    removePromo,
  } = useReviewCart(cartId);

  const { plans, isLoading: plansLoading } = usePlans();
  const plan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);

  const periodLabel = plan?.period === 'MONTHLY' ? '1-month cover' : '1-year cover';
  const planSubtitle = `${periodLabel} · ${plan?.includesLabel ?? 'Smart QR kit'}`;
  const renewSuffix = plan?.period === 'MONTHLY' ? '/month' : '/year';

  const [phase, setPhase] = useState<PayPhase>('idle');

  // Track connectivity so we can gate the pay button (Figma "Offline").
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => {
      setOffline(!navigator.onLine);
    };
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  const payingRef = useRef(false);

  // A re-price kills the pinned order (see the fingerprint rule below), so the
  // "your order is saved" notice would stop being true. Drop back to the plain
  // pay state rather than leave a claim the next press won't honour.
  const repriceKey = cart ? `${String(cart.totalPaise)}|${appliedCode}` : '';
  useEffect(() => {
    setPhase((current) => (current === 'cancelled' ? 'idle' : current));
  }, [repriceKey]);

  const handlePay = async () => {
    if (!cart || offline || payingRef.current) return;

    const journey = readJourneyState();
    const addressId = journey.addressId;
    if (!addressId) {
      router.push(JOURNEY_ROUTES.address(cartId));
      return;
    }

    // `POST /v1/orders` is not idempotent per cart, and a RETAIL_SHIP order has
    // no backend duplicate guard (its qr_code_id is null), so every re-create
    // mints another order number and another fulfillment row. Re-paying an
    // order that is still PENDING_PAYMENT is free and returns the same live
    // Razorpay handle, so resume instead.
    //
    // INVALIDATION RULE: the pin is honoured only while the fingerprint of the
    // purchase on screen (plan, riders, address, promo, total) matches the one
    // stored when the order was created. The backend charges the ORDER's pinned
    // total, so anything that moves the price or the destination must force a
    // fresh order rather than resume a stale one.
    // Read the address LIVE rather than trusting the id, so an edit made on another screen or in
    // another tab is caught. If it cannot be read we deliberately fail SAFE: an unresolvable
    // address yields a stamp that can never match a stored fingerprint, so the pin is dropped and a
    // fresh order is created. That costs at most one extra order, which the backend then supersedes
    // (mig 0099), whereas resuming on an unverified address risks shipping to the wrong house.
    const chosen = await listAddresses()
      .then((all) => all.find((a) => a.id === addressId) ?? null)
      .catch(() => null);

    const fingerprint = purchaseFingerprint({
      planId,
      riderCount,
      addressStamp: chosen ? addressStamp(chosen) : `unverified:${String(Date.now())}`,
      totalPaise: cart.totalPaise,
      promoCode: appliedCode,
    });
    const resumableOrderId =
      journey.orderId && journey.orderFingerprint === fingerprint ? journey.orderId : null;

    // No pre-emptive token refresh on a re-attempt. A token that expired while the sheet was open
    // simply 401s the next call, and the response interceptor (services/purchase/client.ts) refreshes
    // and replays it silently. Refreshing here as well cost a buyer their session on any transient
    // network blip, because a failed refresh clears the session and bounces them back to OTP.
    payingRef.current = true;
    setPhase('processing');
    try {
      let orderId = resumableOrderId;
      const orderCart = cart;
      if (orderId) {
        // The sheet can be dismissed after the payment already went through, so
        // confirm the authoritative outcome before re-paying. A settled order
        // belongs on the status page, never back through checkout.
        const outcome = await getJourneyPaymentOutcome(orderId).catch(() => null);
        if (outcome === 'PAID') {
          patchJourneyState({ orderFingerprint: undefined });
          router.push(JOURNEY_ROUTES.orderStatus(orderId));
          return;
        }
        if (outcome === 'FAILED' || outcome === 'REFUNDED') {
          // Terminal and unpayable: drop the pin and create a fresh order.
          patchJourneyState({ orderFingerprint: undefined });
          orderId = null;
        }
      }
      if (!orderId) {
        // The cart is NOT re-minted on a retry. Since D23 it survives an abandoned or refused payment
        // (it is consumed at CAPTURE, not at order-create), so the one on screen is still the live one.
        // Re-minting here also carried the applied promo into a fresh `POST /v1/cart`, which threw
        // `promo_invalid` 422 on a lapsed code and left the buyer in a failure loop with no way to clear it.
        const order = await createJourneyOrder(orderCart.cartId, addressId);
        orderId = order.orderId;
        // Pin against the cart the order was actually created from: if that
        // cart priced differently from the one on screen, the fingerprints
        // disagree and the next press re-creates rather than mis-charges.
        patchJourneyState({
          orderId,
          orderFingerprint: purchaseFingerprint({
            planId,
            riderCount,
            // The SAME stamp the resume check computes, so a pin written here can actually match
            // later. An unverified address stamps unmatchably on purpose, which simply means the
            // next press creates a fresh order rather than resuming one we could not validate.
            addressStamp: chosen ? addressStamp(chosen) : `unverified:${String(Date.now())}`,
            totalPaise: orderCart.totalPaise,
            promoCode: orderCart.appliedPromoCode ?? '',
          }),
        });
      }

      const ref = await payJourneyOrder(orderId);
      patchJourneyState({ paymentRef: ref.paymentRef });

      let result: RazorpayResult = { status: 'unavailable' };
      if (ref.razorpayKeyId && ref.providerOrderId) {
        const profile = await getJourneyProfile().catch(() => null);
        result = await openRazorpayCheckout({
          keyId: ref.razorpayKeyId,
          orderId: ref.providerOrderId,
          amountPaise: orderCart.totalPaise,
          name: 'Autolokate',
          description: plan?.name ? `${plan.name} plan` : undefined,
          prefill: {
            name: profile?.name ?? undefined,
            contact: getSessionMobile() || undefined,
          },
        });
      }

      // Paid → hand off to the status page, which confirms the webhook-driven
      // outcome. Drop the pin: a paid order can never be resumed.
      if (result.status === 'paid') {
        patchJourneyState({ orderFingerprint: undefined });
        router.push(JOURNEY_ROUTES.orderStatus(orderId));
        return;
      }
      // `dismissed` covers both a closed sheet and a declined card: the helper
      // can't tell them apart. Neither charged anything and both leave the
      // order unpaid, so keep the pin and let the next press resume it.
      setPhase(result.status === 'dismissed' ? 'cancelled' : 'failed');
    } catch (err) {
      // An order the backend no longer knows about can never be paid, so drop
      // the pin. Every other failure keeps it, so a transient error cannot mint
      // a duplicate order.
      if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
        patchJourneyState({ orderFingerprint: undefined });
      }
      setPhase('failed');
    } finally {
      payingRef.current = false;
    }
  };

  const goBack = () => {
    router.push(JOURNEY_ROUTES.address(cartId));
  };

  const bootLoading = authed !== true || status === 'loading' || (plansLoading && !plan);
  const processing = phase === 'processing';
  const payLabel = cart ? `Pay ${formatRupees(cart.totalPaise)}` : 'Pay';

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={3} />

      {status === 'error' ? (
        <div className={styles.errorBody}>
          <JourneyError title="Couldn’t load your order" onRetry={reload} />
        </div>
      ) : (
        <div className={styles.body}>
          <button type="button" className={styles.backLink} onClick={goBack}>
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </button>

          <div className={styles.hd}>
            <h1 className={styles.title}>Review &amp; pay</h1>
            <p className={styles.subhead}>Review your order, then pay securely</p>
          </div>

          <div className={styles.col}>
            {bootLoading || !cart ? (
              <ReviewSkeleton />
            ) : (
              <>
                {offline ? (
                  <div className={cn(styles.notice, styles.noticeOffline)}>
                    <WifiOff className={styles.noticeIcon} aria-hidden />
                    <div className={styles.noticeText}>
                      <span className={styles.noticeTitle}>You’re offline</span>
                      <span className={styles.noticeSub}>Reconnect to pay securely</span>
                    </div>
                  </div>
                ) : phase === 'cancelled' ? (
                  <div className={cn(styles.notice, styles.noticeCancelled)} role="status">
                    <Info className={styles.noticeIcon} aria-hidden />
                    <div className={styles.noticeText}>
                      <span className={styles.noticeTitle}>Payment not completed</span>
                      <span className={styles.noticeSub}>
                        Nothing was charged. Your order is saved, so you can pay when you’re ready.
                      </span>
                    </div>
                  </div>
                ) : phase === 'failed' ? (
                  <div className={cn(styles.notice, styles.noticeFailed)} role="alert">
                    <AlertTriangle className={styles.noticeIcon} aria-hidden />
                    <div className={styles.noticeText}>
                      <span className={styles.noticeTitle}>We couldn’t start the payment</span>
                      <span className={styles.noticeSub}>You haven’t been charged. Try again.</span>
                    </div>
                  </div>
                ) : null}

                <PromoField
                  state={promoState}
                  appliedCode={appliedCode}
                  applying={applyingPromo}
                  onApply={applyPromo}
                  onRemove={removePromo}
                />

                <OrderSummaryCard
                  cart={cart}
                  planName={plan?.name ?? 'Your plan'}
                  planSubtitle={planSubtitle}
                  riderCount={riderCount}
                  appliedCode={appliedCode}
                />

                <div className={styles.autoRenew}>
                  <RefreshCw className={styles.autoRenewIcon} aria-hidden />
                  <div className={styles.autoRenewText}>
                    <span className={styles.autoRenewTitle}>
                      Auto-renews at {formatRupees(cart.totalPaise)}
                      {renewSuffix}
                    </span>
                    <span className={styles.autoRenewSub}>We’ll remind you before it renews</span>
                  </div>
                </div>

                {processing ? (
                  <div className={styles.processing}>
                    <Loader2 className={styles.spinner} aria-hidden />
                    {/* This window covers reading the address, creating the order and opening the
                        sheet, all BEFORE the buyer has entered a single payment detail. On a slow
                        connection that is many seconds, so it must not claim money is moving. */}
                    Opening secure payment
                  </div>
                ) : (
                  <button
                    type="button"
                    className={cn(styles.cta, offline && styles.ctaDisabled)}
                    onClick={() => void handlePay()}
                    disabled={offline}
                  >
                    {offline ? (
                      'Reconnect to pay'
                    ) : phase === 'failed' ? (
                      <>
                        Retry payment
                        <RotateCw className={styles.ctaIcon} aria-hidden />
                      </>
                    ) : (
                      <>
                        {payLabel}
                        <ArrowRight className={styles.ctaIcon} aria-hidden />
                      </>
                    )}
                  </button>
                )}

                <div className={styles.fine}>
                  <Lock className={styles.fineIcon} aria-hidden />
                  <span>
                    {processing
                      ? 'Setting up your payment · please don’t close this page'
                      : 'Secure payment · UPI, cards, netbanking'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
