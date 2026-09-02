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

/** The visual states of an order card (Figma "WebOrderCard"). */
type CardState = 'shipping' | 'delivered' | 'active' | 'unpaid' | 'failed' | 'cancelled';

interface OrderCardProps {
  order: OrderSummary;
  invoiceLoading?: boolean;
  onTrack: (orderId: string) => void;
  onInvoice: (orderId: string) => void;
  onUpgrade: (orderId: string) => void;
  onRetry: (orderId: string) => void;
  onGetHelp: () => void;
}

/**
 * Derive the display state from the order + shipment status. Money state leads:
 * an order that has not been paid for cannot be shipping, so `PENDING_PAYMENT`
 * and `DRAFT` resolve before any fulfillment is consulted. `CANCELLED` is kept
 * apart from `FAILED` because a cancelled order is terminal (re-checking out an
 * edited cart supersedes the prior unpaid order), so it must not offer a retry.
 */
function deriveState(order: OrderSummary): CardState {
  if (order.status === 'CANCELLED') return 'cancelled';
  if (order.status === 'FAILED') return 'failed';
  if (order.status === 'PENDING_PAYMENT' || order.status === 'DRAFT') return 'unpaid';
  const f = order.fulfillment?.status;
  if (f === 'DELIVERED') return 'delivered';
  if (order.orderKind === 'SCAN_SELF_PAY') return 'active';
  if (f === 'ALLOCATED' || f === 'SHIPPED' || f === 'IN_TRANSIT' || f === 'PAID') return 'shipping';
  return 'active';
}

const STATUS_TITLE: Record<string, string> = {
  PAID: 'Order placed',
  ALLOCATED: 'Packed',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'Out for delivery',
};

/**
 * Titles for every state that is not `shipping` (which reads the courier status above).
 * `unpaid` must never imply the order is on its way: since D23 a dismissed sheet or a refused
 * card leaves the order alive and retryable, so these rows are now common rather than rare.
 */
const STATE_TITLE: Record<CardState, string> = {
  shipping: 'On its way',
  delivered: 'Delivered',
  active: 'Protection active',
  unpaid: 'Payment not completed',
  failed: 'Payment not completed',
  cancelled: 'Order cancelled',
};

/** One calm line saying what is true and what the buyer can do about it. */
const STATE_SUBLINE: Record<CardState, string> = {
  shipping: '',
  delivered: '',
  active: '',
  unpaid: 'Nothing has been charged. Your order is saved, so you can pay whenever you are ready.',
  failed: 'Nothing has been charged for this order.',
  cancelled: 'This order was replaced by a newer one.',
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
  const dateLine = formatDate(order.createdAt);

  const title =
    state === 'shipping'
      ? (STATUS_TITLE[order.fulfillment?.status ?? 'PAID'] ?? 'On its way')
      : STATE_TITLE[state];

  const subline = STATE_SUBLINE[state];

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
          <span className={styles.metaRef}>Order {order.orderNumber}</span>
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
