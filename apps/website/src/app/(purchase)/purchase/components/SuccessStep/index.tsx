'use client';

import { ArrowRight, Check, Download, Loader2, X } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { cn } from '@/lib/utils';
import { useDownloadInvoice, useOrderPayment } from '@/hooks/purchase';
import type { StepProps } from '../../types';
import styles from './index.module.css';

export function SuccessStep({ state, plan, goTo }: StepProps) {
  const firstName = state.name.trim().split(' ')[0] || 'driver';
  // `setupMandate` sent to the pay API is `state.autoRenew`.
  const renewNote = state.autoRenew
    ? 'Auto-renewal is enabled, so your current price is locked in for next year.'
    : 'Auto-renewal is disabled, so your current price is not locked in for next year.';

  const { outcome, isSettled } = useOrderPayment(state.orderId);
  const { mutateAsync: downloadInvoice, isLoading: downloadingInvoice } = useDownloadInvoice({
    errorToast: true,
    successToast: 'Opening your invoice',
  });

  const handleDownloadInvoice = () => {
    if (!state.orderId) return;
    void downloadInvoice(state.orderId).catch(() => {
      // Error toast is surfaced by the mutation hook.
    });
  };

  // With no order id (e.g. a direct visit) we optimistically show the confirmed
  // state; otherwise we reflect the polled payment outcome.
  const failed = outcome === 'FAILED' || outcome === 'REFUNDED';
  const confirming = Boolean(state.orderId) && !isSettled && !failed;
  const orderRef = state.orderId ? `#${state.orderId}` : '#AL-48291';

  if (failed) {
    return (
      <div className={styles.wrap}>
        <span className={cn(styles.badge, styles.badgeFailed)} aria-hidden>
          <X className="h-8 w-8 stroke-[3]" />
        </span>
        <h1 className={cn(styles.title, 'font-display')}>Payment didn&apos;t go through</h1>
        <p className={styles.lead}>
          Order <b className={styles.mono}>{orderRef}</b> couldn&apos;t be paid. No money was taken
          — you can try again.
        </p>
        <AlButton
          size="lg"
          radius="lg"
          variant="primary"
          onClick={() => {
            goTo('summary');
          }}
        >
          Back to payment
        </AlButton>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className={styles.wrap}>
        <span className={cn(styles.badge, styles.badgePending)} aria-hidden>
          <Loader2 className="h-8 w-8 animate-spin" />
        </span>
        <h1 className={cn(styles.title, 'font-display')}>Confirming your payment…</h1>
        <p className={styles.lead}>
          Hang tight — we&apos;re confirming order <b className={styles.mono}>{orderRef}</b> with
          your bank. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.badge} aria-hidden>
        <Check className="h-8 w-8 stroke-[3]" />
      </span>

      <h1 className={cn(styles.title, 'font-display')}>You&apos;re covered, {firstName}.</h1>
      <p className={cn(styles.lead, styles.leadTight)}>
        Order <b className={styles.mono}>{orderRef}</b> confirmed! 🎉
      </p>
      <p className={cn(styles.lead, styles.leadTight)}>
        Your {plan.name} QR Kit will be shipped within 24 hours. We&apos;ve also sent the order
        confirmation to your WhatsApp.
      </p>
      <p className={styles.lead}>{renewNote}</p>

      <div className={styles.card}>
        <p className={styles.cardTitle}>While the sticker&apos;s on its way:</p>
        <ol className={styles.steps}>
          <li>
            <span className={styles.num}>1.</span> Download the Autolokate app
          </li>
          <li>
            <span className={styles.num}>2.</span> Sign in with +91 {state.mobile || 'your number'}
          </li>
          <li>
            <span className={styles.num}>3.</span> When the kit arrives, scan the QR &amp; enter
            your plate — done
          </li>
          {state.orderId ? (
            <li>
              <span className={styles.num}>4.</span> Need it for records?{' '}
              <button
                type="button"
                className={styles.invoiceLink}
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
              >
                {downloadingInvoice ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Preparing…
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Download GST invoice
                  </>
                )}
              </button>
            </li>
          ) : null}
        </ol>
      </div>

      <div className={styles.storeRow}>
        <span className={styles.store}>▶ Google Play</span>
        <span className={styles.store}> App Store</span>
      </div>

      <button
        type="button"
        className={styles.track}
        onClick={() => {
          goTo('tracking');
        }}
      >
        Track your shipment
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
