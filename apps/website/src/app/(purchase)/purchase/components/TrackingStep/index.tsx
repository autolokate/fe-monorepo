'use client';

import { ArrowRight, Check, Lightbulb, Loader2 } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { cn } from '@/lib/utils';
import { useOrderTracking } from '@/hooks/purchase';
import type { FulfillmentStatus, OrderFulfillment } from '@/services/purchase';
import { TRACKING_STEPS } from '../../constants';
import type { StepProps } from '../../types';
import { StepShell } from '../StepShell';
import styles from './index.module.css';

type RowState = 'done' | 'active' | 'pending';
interface TimelineRow {
  title: string;
  desc: string;
  state: RowState;
  /** Formatted timestamp from the fulfillment event, when we have one. */
  time?: string;
}

/** Fulfillment FSM order — used to mark stages done / active / pending. */
const STAGE_ORDER: FulfillmentStatus[] = [
  'PAID',
  'ALLOCATED',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
];

/** ISO timestamp → "14 Jul 2026, 1:17 PM" (buyer's locale, best effort). */
function formatEventTime(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildTimeline(fulfillment: OrderFulfillment): TimelineRow[] {
  const { status, courier, awbNo, events } = fulfillment;
  const currentIndex = status ? STAGE_ORDER.indexOf(status) : 0;

  // Latest event per stage, so each row can show its real timestamp + courier note.
  const byStatus = new Map<FulfillmentStatus, { rawStatus?: string | null; occurredAt: string }>();
  for (const event of events ?? []) {
    byStatus.set(event.status, { rawStatus: event.rawStatus, occurredAt: event.occurredAt });
  }

  const shippedEvent = byStatus.get('SHIPPED');
  const shipDesc =
    shippedEvent?.rawStatus ??
    (awbNo ? `AWB ${awbNo}${courier ? ` · ${courier}` : ''}` : 'Leaving our facility soon');

  const labels: { title: string; desc: string; status: FulfillmentStatus }[] = [
    { title: 'Order confirmed', desc: 'Payment received · GST invoice emailed', status: 'PAID' },
    {
      title: 'QR code allocated',
      desc: 'Your unique vehicle QR is reserved and printed',
      status: 'ALLOCATED',
    },
    { title: 'Shipped', desc: shipDesc, status: 'SHIPPED' },
    { title: 'In transit', desc: 'With the courier — on its way to you', status: 'IN_TRANSIT' },
    {
      title: 'Delivered → ready to activate',
      desc: 'QR becomes scannable · activate in the app',
      status: 'DELIVERED',
    },
  ];

  return labels.map((row, index) => {
    const occurredAt =
      byStatus.get(row.status)?.occurredAt ??
      (row.status === 'ALLOCATED' ? fulfillment.allocatedAt : undefined) ??
      (row.status === 'SHIPPED' ? fulfillment.shippedAt : undefined) ??
      (row.status === 'DELIVERED' ? fulfillment.deliveredAt : undefined);

    return {
      title: row.title,
      desc: row.desc,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending',
      time: formatEventTime(occurredAt),
    };
  });
}

export function TrackingStep({ state, goTo }: StepProps) {
  const shipCity = state.city.trim() || 'your city';
  const { data: order, isLoading } = useOrderTracking(state.orderId);

  const fulfillment = order?.fulfillment ?? null;
  const rows: TimelineRow[] = order ? buildTimeline(fulfillment ?? {}) : TRACKING_STEPS;

  const orderRef = state.orderId ? `#${state.orderId.slice(0, 8).toUpperCase()}` : '#AL-48291';

  return (
    <StepShell
      title="Your kit is on its way"
      backLabel="Order confirmation"
      onBack={() => {
        goTo('success');
      }}
    >
      <p className={styles.meta}>
        Order <b className={styles.mono}>{orderRef}</b>
        {fulfillment?.awbNo ? (
          <>
            {' '}
            · AWB <b className={styles.mono}>{fulfillment.awbNo}</b>
          </>
        ) : null}
        {fulfillment?.trackingUrl ? (
          <>
            {' · '}
            <a
              className={styles.trackLink}
              href={fulfillment.trackingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Track live
            </a>
          </>
        ) : null}
      </p>
      <p className={styles.ship}>
        Shipping to {state.name || 'you'}, {state.addr || 'your address'}, {shipCity} {state.pin}
      </p>

      {isLoading && !order ? (
        <div className={styles.card}>
          <p className={styles.ship}>
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
            Fetching the latest status…
          </p>
        </div>
      ) : (
        <div className={styles.card}>
          {rows.map((step, index) => {
            const isLast = index === rows.length - 1;
            return (
              <div key={step.title} className={styles.row}>
                <div className={styles.rail}>
                  <span
                    className={cn(
                      styles.dot,
                      step.state === 'done' && styles.dotDone,
                      step.state === 'active' && styles.dotActive,
                    )}
                  >
                    {step.state === 'done' ? (
                      <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                    ) : step.state === 'active' ? (
                      '●'
                    ) : (
                      ''
                    )}
                  </span>
                  {!isLast ? (
                    <span
                      className={cn(styles.line, step.state === 'done' && styles.lineDone)}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className={styles.content}>
                  <p
                    className={cn(
                      styles.rowTitle,
                      step.state === 'pending' && styles.rowTitleMuted,
                    )}
                  >
                    {step.title}
                  </p>
                  <p className={styles.rowDesc}>{step.desc}</p>
                  {step.time ? <p className={styles.rowTime}>{step.time}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.tip}>
        <Lightbulb className="h-4 w-4 shrink-0" aria-hidden />
        Once delivered, your QR flips to <b>scannable</b> automatically. Open the app, scan it,
        enter your plate — your cover activates instantly. No extra payment.
      </p>

      <AlButton
        size="lg"
        radius="lg"
        variant="primary"
        className={styles.action}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={() => {
          goTo('scan');
        }}
      >
        Delivered? Scan the QR to activate
      </AlButton>
    </StepShell>
  );
}
