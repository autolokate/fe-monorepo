'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  RefreshCw,
  RotateCw,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openRazorpayCheckout, type RazorpayResult } from '@/lib/payments/razorpay';
import { JourneyHeader } from '../../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../../shared/components/JourneyProgress';
import { JourneyError } from '../../../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../../../shared/routes';
import { patchJourneyState, readJourneyState } from '../../../../../shared/storage';
import { usePlans } from '../../../../../shared/hooks/usePlans';
import { formatRupees } from '../../../../../shared/plans';
import {
  createJourneyCart,
  createJourneyOrder,
  getSessionMobile,
  isPurchaseAuthenticated,
  payJourneyOrder,
} from '../../../../../shared/services/checkout-api';
import { getJourneyProfile, refreshPurchaseSession } from '../../../../../shared/services/auth-api';
import { useReviewCart } from '../../hooks/useReviewCart';
import { OrderSummaryCard } from '../OrderSummaryCard';
import { PromoField } from '../PromoField';
import { ReviewSkeleton } from '../ReviewSkeleton';
import styles from './index.module.css';

interface ReviewViewProps {
  /** Cart minted after verify — keys this route and drives all pricing. */
  cartId: string;
}

type PayPhase = 'idle' | 'processing' | 'failed';

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

  const handlePay = async () => {
    if (!cart || offline || payingRef.current) return;

    const addressId = readJourneyState().addressId;
    if (!addressId) {
      router.push(JOURNEY_ROUTES.address(cartId));
      return;
    }

    // A retry (previous attempt failed) rides on a token that may have expired
    // while Razorpay was open, and its cart was already consumed by the first
    // order — so on retry we mint a fresh token (`/v1/auth/refresh`) and then a
    // fresh cart (`POST /v1/cart`) before ordering again. If refresh fails, the
    // session is gone: send them to re-verify.
    const isRetry = phase === 'failed';

    payingRef.current = true;
    setPhase('processing');
    try {
      let orderCart = cart;
      if (isRetry) {
        const token = await refreshPurchaseSession(true);
        if (!token || !planId) {
          payingRef.current = false;
          router.replace(planId ? JOURNEY_ROUTES.verify(planId) : JOURNEY_ROUTES.buy);
          return;
        }
        orderCart = await createJourneyCart(planId, riderCount, appliedCode || undefined);
        patchJourneyState({ cartId: orderCart.cartId });
      }

      const order = await createJourneyOrder(orderCart.cartId, addressId);
      const ref = await payJourneyOrder(order.orderId);
      patchJourneyState({ orderId: order.orderId, paymentRef: ref.paymentRef });

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

      // Payment attempted → hand off to the status page, which confirms the
      // webhook-driven outcome (confirming → success/failed). A dismissed modal
      // or an unavailable SDK means nothing was charged: stay here to retry.
      if (result.status === 'paid') {
        router.push(JOURNEY_ROUTES.orderStatus(order.orderId));
        return;
      }
      setPhase('failed');
    } catch {
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
                ) : phase === 'failed' ? (
                  <div className={cn(styles.notice, styles.noticeFailed)}>
                    <AlertTriangle className={styles.noticeIcon} aria-hidden />
                    <div className={styles.noticeText}>
                      <span className={styles.noticeTitle}>Payment didn’t go through</span>
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
                    Processing your payment
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
                      ? 'Secure payment in progress · please don’t close this page'
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
