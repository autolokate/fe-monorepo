'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Download,
  Package,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderSummary } from '@/services/purchase';
import { formatRupees } from '../../../shared/plans';
import styles from './index.module.css';

/** The four visual states of an order card (Figma "WebOrderCard"). */
type CardState = 'shipping' | 'delivered' | 'active' | 'failed';

interface OrderCardProps {
  order: OrderSummary;
  invoiceLoading?: boolean;
  onTrack: (orderId: string) => void;
  onInvoice: (orderId: string) => void;
  onUpgrade: (orderId: string) => void;
  onRetry: (orderId: string) => void;
  onGetHelp: () => void;
}

/** Derive the display state from the order + shipment status (best-effort). */
function deriveState(order: OrderSummary): CardState {
  if (order.status === 'FAILED' || order.status === 'CANCELLED') return 'failed';
  const f = order.fulfillment?.status;
  if (f === 'DELIVERED') return 'delivered';
  if (order.orderKind === 'SCAN_SELF_PAY') return 'active';
  if (f === 'ALLOCATED' || f === 'SHIPPED' || f === 'IN_TRANSIT' || f === 'PAID') return 'shipping';
  return order.status === 'PAID' ? 'active' : 'shipping';
}

const STATUS_TITLE: Record<string, string> = {
  PAID: 'Order placed',
  ALLOCATED: 'Packed',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'Out for delivery',
};

/** ISO → "18 Jul 2026". */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function OrderCard({
  order,
  invoiceLoading = false,
  onTrack,
  onInvoice,
  onUpgrade,
  onRetry,
  onGetHelp,
}: OrderCardProps) {
  const state = deriveState(order);
  const orderRef = order.orderId.slice(0, 8).toUpperCase();
  const dateLine = formatDate(order.createdAt);

  const title =
    state === 'shipping'
      ? (STATUS_TITLE[order.fulfillment?.status ?? 'PAID'] ?? 'On its way')
      : state === 'delivered'
        ? 'Delivered'
        : state === 'active'
          ? 'Active'
          : 'Payment failed';

  const subline =
    state === 'shipping'
      ? 'On its way'
      : state === 'delivered'
        ? 'Ready to activate'
        : state === 'active'
          ? 'Your cover is on'
          : 'You haven’t been charged';

  const showHint = state === 'shipping' || state === 'delivered';
  const showUpgrade = state === 'shipping' || state === 'delivered';

  return (
    <article className={styles.card}>
      <span
        className={cn(
          styles.icon,
          state === 'active' && styles.iconActive,
          state === 'failed' && styles.iconFailed,
        )}
      >
        {state === 'active' ? (
          <ShieldCheck className={styles.iconGlyph} aria-hidden />
        ) : state === 'failed' ? (
          <CreditCard className={styles.iconGlyph} aria-hidden />
        ) : (
          <Package className={styles.iconGlyph} aria-hidden />
        )}
      </span>

      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.status}>
            <div className={styles.statusRow}>
              <span className={cn(styles.statusTitle, state === 'failed' && styles.statusFailed)}>
                {title}
              </span>
              {state === 'shipping' ? (
                <button
                  type="button"
                  className={styles.trackLink}
                  onClick={() => {
                    onTrack(order.orderId);
                  }}
                >
                  Track order
                  <ArrowUpRight className={styles.trackIcon} aria-hidden />
                </button>
              ) : null}
            </div>
            <span className={styles.subline}>{subline}</span>
          </div>

          <div className={styles.amountCol}>
            <span className={styles.amount}>{formatRupees(order.totalPaise)}</span>
            <span className={styles.amountNote}>
              {state === 'failed' ? 'not paid' : 'incl. GST'}
            </span>
          </div>
        </div>

        <div className={styles.plan}>
          <span className={styles.planName}>{order.planName}</span>
          <span className={styles.planSub}>Smart QR kit</span>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaRef}>Order {orderRef}</span>
          {dateLine ? (
            <span className={styles.metaDate}>
              {state === 'failed' ? 'Tried' : 'Placed'} {dateLine}
            </span>
          ) : null}
        </div>

        {showHint ? (
          <div className={styles.hint}>
            <Sparkles className={styles.hintIcon} aria-hidden />
            <span className={styles.hintText}>
              Upgrade to a higher plan anytime before you activate
            </span>
          </div>
        ) : null}

        <div className={cn(styles.actions, state === 'active' && styles.actionsCenter)}>
          {state === 'failed' ? (
            <>
              <button type="button" className={styles.textAction} onClick={onGetHelp}>
                Get help
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  onRetry(order.orderId);
                }}
              >
                Retry payment
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.invoiceAction}
                onClick={() => {
                  onInvoice(order.orderId);
                }}
                disabled={invoiceLoading}
              >
                <Download className={styles.invoiceIcon} aria-hidden />
                {invoiceLoading ? 'Preparing…' : 'Download invoice'}
              </button>
              {showUpgrade ? (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => {
                    onUpgrade(order.orderId);
                  }}
                >
                  Upgrade plan
                  <ArrowRight className={styles.primaryIcon} aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
