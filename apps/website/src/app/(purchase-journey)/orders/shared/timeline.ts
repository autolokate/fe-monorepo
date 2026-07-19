import type { FulfillmentStatus, OrderFulfillment } from '@/services/purchase';

export type RowState = 'done' | 'active' | 'pending';

export interface TimelineRow {
  title: string;
  desc?: string;
  state: RowState;
}

/** Fulfillment FSM order — drives done / active / pending across the rail. */
const STAGE_ORDER: FulfillmentStatus[] = [
  'PAID',
  'ALLOCATED',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
];

const STAGE_LABEL: Record<string, string> = {
  PAID: 'Order placed',
  ALLOCATED: 'Packed',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'Out for delivery',
  DELIVERED: 'Delivered',
};

/** Headline + reassurance line for the current fulfillment stage. */
export const TRACK_BANNER: Record<string, { title: string; sub: string }> = {
  PAID: { title: 'Order confirmed', sub: 'We’re preparing your kit' },
  ALLOCATED: { title: 'Packed', sub: 'Getting ready to ship' },
  SHIPPED: { title: 'Shipped', sub: 'On its way to you' },
  IN_TRANSIT: { title: 'Out for delivery', sub: 'We’ll notify you when it’s delivered' },
  DELIVERED: { title: 'Delivered', sub: 'Scan the QR to activate your cover' },
  RETURNED: { title: 'Returned', sub: 'Message us and we’ll sort it out' },
  CANCELLED: { title: 'Cancelled', sub: 'This order was cancelled' },
};

/** ISO → "17 Jul, 2:34 pm" (buyer's locale, best effort). */
export function formatEventTime(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Map an order's fulfillment into the 5-stage timeline rows. */
export function buildTimeline(fulfillment: OrderFulfillment): TimelineRow[] {
  const { status, courier, awbNo, events } = fulfillment;
  const stageIndex = status ? STAGE_ORDER.indexOf(status) : 0;
  const currentIndex = stageIndex === -1 ? 0 : stageIndex;

  const byStatus = new Map<FulfillmentStatus, string>();
  for (const event of events ?? []) {
    byStatus.set(event.status, event.occurredAt);
  }

  return STAGE_ORDER.map((stage, index) => {
    const occurredAt =
      byStatus.get(stage) ??
      (stage === 'ALLOCATED' ? fulfillment.allocatedAt : undefined) ??
      (stage === 'SHIPPED' ? fulfillment.shippedAt : undefined) ??
      (stage === 'DELIVERED' ? fulfillment.deliveredAt : undefined);

    const time = formatEventTime(occurredAt);
    const state: RowState =
      index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';

    let desc = time;
    if (stage === 'SHIPPED' && state !== 'pending') {
      desc =
        [time, courier, awbNo ? `AWB ${awbNo}` : null].filter(Boolean).join(' · ') || undefined;
    }

    return { title: STAGE_LABEL[stage], desc: state === 'pending' ? undefined : desc, state };
  });
}

/** Best-effort banner for a fulfillment status. */
export function trackBanner(status?: FulfillmentStatus | null): { title: string; sub: string } {
  const banner = status ? TRACK_BANNER[status] : undefined;
  return banner ?? { title: 'Preparing your order', sub: 'We’ll update this as it ships' };
}
