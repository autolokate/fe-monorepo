'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  QrCode,
  RotateCw,
  Truck,
  X,
} from 'lucide-react';
import { WHATSAPP_URL } from '@/layouts/Footer/constants';
import {
  useDownloadInvoice,
  useOrderPayment,
  useOrderTracking,
  usePurchaseAddresses,
} from '@/hooks/purchase';
import { JourneyHeader } from '../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../shared/components/JourneyProgress';
import { JOURNEY_ROUTES } from '../../../../shared/routes';
import { readJourneyState } from '../../../../shared/storage';
import { usePlans } from '../../../../shared/hooks/usePlans';
import { formatRupees } from '../../../../shared/plans';
import { getJourneyProfile } from '../../../../shared/services/auth-api';
import styles from './index.module.css';

interface OrderStatusViewProps {
  /** The order id (UUID) from the URL — all order APIs are keyed by it. */
  orderNo: string;
}

export function OrderStatusView({ orderNo }: OrderStatusViewProps) {
  const router = useRouter();

  // Webhook-driven outcome: null/PENDING/UNCONFIRMED → confirming; PAID → success;
  // FAILED/REFUNDED → failed. Polls every 3s and stops once terminal or capped.
  const { outcome, orderNumber, transactionRef, isSettled, timedOut } = useOrderPayment(orderNo);
  const failed = outcome === 'FAILED' || outcome === 'REFUNDED';
  const success = outcome === 'PAID' && isSettled;
  // Polling hit its cap without an answer. The payment is still settling on the
  // backend, so say that plainly instead of spinning forever.
  const settling = !failed && !success && timedOut;
  const phase: 'confirming' | 'settling' | 'success' | 'failed' = failed
    ? 'failed'
    : success
      ? 'success'
      : settling
        ? 'settling'
        : 'confirming';

  // The order slice chosen during this journey (best-effort card details).
  const snapshot = useMemo(() => readJourneyState(), []);

  // Success-only lookups.
  const { data: tracking } = useOrderTracking(success ? orderNo : null);
  const { plans } = usePlans();
  const { data: addresses = [] } = usePurchaseAddresses(success);
  const downloadInvoice = useDownloadInvoice({
    errorToast: true,
    successToast: 'Opening your invoice',
  });

  const [name, setName] = useState('');
  useEffect(() => {
    if (!success) return;
    let active = true;
    getJourneyProfile()
      .then((profile) => {
        if (active) setName(profile.name);
      })
      .catch(() => {
        /* name is optional on this screen */
      });
    return () => {
      active = false;
    };
  }, [success]);

  const plan = plans.find((p) => p.id === snapshot.planId);
  // Riders are PINNED on the order, so the server read wins over the local
  // journey snapshot (which is absent entirely on a fresh device or a re-visit).
  const riderCount = tracking?.riderCount ?? snapshot.riderCount ?? 0;
  const riderCoverPaise = tracking?.riderCoverPaise ?? 0;
  const address = addresses.find((a) => a.id === snapshot.addressId) ?? null;
  const amountPaise = tracking?.totalPaise;

  // The buyer-facing order number from the payment read. It lands on the first
  // poll and is present on every outcome; until then we show nothing rather
  // than a slice of the UUID, which support cannot look anything up by.
  const orderRef = orderNumber;
  const planLine = `${plan?.name ?? 'Autolokate plan'}${
    riderCount > 0 ? ` + ${String(riderCount)} rider${riderCount > 1 ? 's' : ''}` : ''
  }`;
  const planSub = `${plan?.period === 'MONTHLY' ? '1-month cover' : '1-year cover'} · Smart QR kit`;

  const handleTrack = () => {
    router.push(JOURNEY_ROUTES.orderTrack(orderNo));
  };

  const retryTarget = snapshot.cartId ? JOURNEY_ROUTES.review(snapshot.cartId) : JOURNEY_ROUTES.buy;

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={phase === 'success' ? 4 : 3} />

      <div className={styles.body}>
        {phase === 'failed' ? (
          <button
            type="button"
            className={styles.backLink}
            onClick={() => {
              router.push(retryTarget);
            }}
          >
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </button>
        ) : null}

        <div className={styles.col}>
          {phase === 'confirming' ? (
            <div className={styles.confirming}>
              <Loader2 className={styles.spinner} aria-hidden />
              <div className={styles.centerText}>
                <h1 className={styles.confirmTitle}>Confirming your payment</h1>
                <p className={styles.sub}>
                  This takes a few seconds. Please don’t close this page.
                </p>
              </div>
            </div>
          ) : null}

          {phase === 'settling' ? (
            <div className={styles.failed}>
              <span className={styles.markWaiting}>
                <Clock className={styles.markIcon} aria-hidden />
              </span>
              <div className={styles.centerText}>
                <h1 className={styles.title}>Still confirming your payment</h1>
                <p className={styles.sub}>
                  We haven’t had confirmation for {orderRef ? `order ${orderRef}` : 'this order'}{' '}
                  yet. This can take a few more minutes. You don’t need to wait here or pay again:
                  we’ll message you the moment it clears, and the order will show up under your
                  orders.
                </p>
                {transactionRef ? (
                  <p className={styles.sub}>Transaction ID {transactionRef}</p>
                ) : null}
              </div>
              <div className={styles.ctaRow}>
                <a
                  className={styles.secondaryCta}
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get help
                </a>
                <button
                  type="button"
                  className={styles.primaryCta}
                  onClick={() => {
                    router.push(JOURNEY_ROUTES.orders);
                  }}
                >
                  View your orders
                  <ArrowRight className={styles.ctaIcon} aria-hidden />
                </button>
              </div>
            </div>
          ) : null}

          {phase === 'success' ? (
            <>
              <div className={styles.head}>
                <span className={styles.markSuccess}>
                  <Check className={styles.markIcon} aria-hidden />
                </span>
                <div className={styles.centerText}>
                  <h1 className={styles.title}>Payment successful</h1>
                  <p className={styles.sub}>
                    {name ? `Thank you, ${name}` : 'Thank you'}
                    {amountPaise != null ? ` · ${formatRupees(amountPaise)} paid` : ''}
                  </p>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardRowLeft}>
                    <span className={styles.planName}>{planLine}</span>
                    <span className={styles.planSub}>{planSub}</span>
                  </div>
                  {amountPaise != null ? (
                    <span className={styles.amount}>{formatRupees(amountPaise)}</span>
                  ) : null}
                </div>

                {riderCount > 0 && riderCoverPaise > 0 ? (
                  <div className={styles.meta}>
                    <span className={styles.metaLabel}>Rider cover × {riderCount} (included)</span>
                    <span className={styles.metaValue}>{formatRupees(riderCoverPaise)}</span>
                  </div>
                ) : null}

                <div className={styles.divider} />

                {orderRef ? (
                  <div className={styles.meta}>
                    <span className={styles.metaLabel}>Order number</span>
                    <span className={styles.metaValue}>{orderRef}</span>
                  </div>
                ) : null}
                {/* The gateway's ref is the one a bank recognises, so it leads. Ours is
                    the fallback: still useful to support, but not a bank reference. */}
                {transactionRef ? (
                  <div className={styles.meta}>
                    <span className={styles.metaLabel}>Transaction ID</span>
                    <span className={styles.metaValue}>{transactionRef}</span>
                  </div>
                ) : snapshot.paymentRef ? (
                  <div className={styles.meta}>
                    <span className={styles.metaLabel}>Payment reference</span>
                    <span className={styles.metaValue}>{snapshot.paymentRef}</span>
                  </div>
                ) : null}

                {address ? (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.ship}>
                      <Truck className={styles.shipIcon} aria-hidden />
                      <div className={styles.shipText}>
                        <span className={styles.shipTitle}>Ships to {name || 'you'}</span>
                        <span className={styles.shipSub}>
                          {address.line1}, {address.city} {address.pincode}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                className={styles.invoiceLink}
                onClick={() => void downloadInvoice.mutateAsync(orderNo).catch(() => {})}
                disabled={downloadInvoice.isLoading}
              >
                <Download className={styles.invoiceIcon} aria-hidden />
                {downloadInvoice.isLoading ? 'Preparing…' : 'Download invoice'}
              </button>

              <div className={styles.whatsNext}>
                <span className={styles.whatsNextLabel}>What’s next</span>
                <div className={styles.nextStep}>
                  <span className={styles.nextIcon}>
                    <MessageSquare className={styles.nextIconGlyph} aria-hidden />
                  </span>
                  <span className={styles.nextText}>
                    We’ll text you the tracking link once it ships
                  </span>
                </div>
                <div className={styles.nextStep}>
                  <span className={styles.nextIcon}>
                    <QrCode className={styles.nextIconGlyph} aria-hidden />
                  </span>
                  <span className={styles.nextText}>
                    Scan it when it arrives to activate your cover
                  </span>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <button type="button" className={styles.secondaryCta} onClick={handleTrack}>
                  Track your order
                </button>
                <button
                  type="button"
                  className={styles.primaryCta}
                  onClick={() => {
                    router.push('/');
                  }}
                >
                  Go to home
                  <ArrowRight className={styles.ctaIcon} aria-hidden />
                </button>
              </div>
            </>
          ) : null}

          {phase === 'failed' ? (
            <div className={styles.failed}>
              <span className={styles.markFail}>
                <X className={styles.markIcon} aria-hidden />
              </span>
              <div className={styles.centerText}>
                <h1 className={styles.title}>
                  {outcome === 'REFUNDED' ? 'Payment refunded' : 'Payment didn’t go through'}
                </h1>
                <p className={styles.sub}>
                  {outcome === 'REFUNDED'
                    ? 'This payment was refunded. It can take a few days to show on your statement.'
                    : 'This payment wasn’t completed. You can try again.'}
                </p>
                {/* A failure is exactly when a buyer rings support or their bank, so both
                    references belong here, not only on the success card. */}
                {orderRef ? (
                  <p className={styles.sub}>
                    Order {orderRef}
                    {transactionRef ? ` · Transaction ID ${transactionRef}` : ''}
                  </p>
                ) : null}
              </div>
              <div className={styles.ctaRow}>
                <a
                  className={styles.secondaryCta}
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get help
                </a>
                <button
                  type="button"
                  className={styles.primaryCta}
                  onClick={() => {
                    router.push(retryTarget);
                  }}
                >
                  Try again
                  <RotateCw className={styles.ctaIcon} aria-hidden />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
