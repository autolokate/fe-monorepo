'use client';

import { Check, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, formatINR } from '@/lib/utils';
import { useOrderTracking } from '@/hooks/purchase';
import type {
  FulfillmentStatus,
  OrderFulfillment,
  OrderStatus,
  OrderSummary,
} from '@/services/purchase';
import { ORDER_KIND_LABELS, STATUS_LABELS, formatDate } from './format';

interface OrderDetailDialogProps {
  /** The list row that was clicked — seeds header info while detail loads. */
  order: OrderSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Fulfillment FSM order — used to mark stages done / active / pending. */
const STAGE_ORDER: FulfillmentStatus[] = [
  'PAID',
  'ALLOCATED',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
];

type RowState = 'done' | 'active' | 'pending';

interface TimelineRow {
  title: string;
  desc: string;
  state: RowState;
  time?: string;
}

function buildTimeline(fulfillment: OrderFulfillment): TimelineRow[] {
  const { status, courier, awbNo, events } = fulfillment;
  const currentIndex = status ? STAGE_ORDER.indexOf(status) : 0;

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
      time: formatDate(occurredAt) || undefined,
    };
  });
}

function statusPillClass(status: OrderStatus): string {
  if (status === 'PAID') return 'bg-success/15 text-success';
  if (status === 'FAILED' || status === 'CANCELLED') return 'bg-destructive/15 text-destructive';
  return 'bg-muted-foreground/15 text-muted-foreground';
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { data: detail, isLoading } = useOrderTracking(open ? (order?.orderId ?? null) : null);

  const status = detail?.status ?? order?.status;
  const kind = detail?.orderKind ?? order?.orderKind;
  const totalPaise = detail?.totalPaise ?? order?.totalPaise;
  const fulfillment = detail?.fulfillment ?? order?.fulfillment ?? null;
  const rows = fulfillment ? buildTimeline(fulfillment) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <DialogTitle>{order?.planName ?? 'Order details'}</DialogTitle>
            {status ? (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
                  statusPillClass(status),
                )}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- backend OrderStatus can outrun the FE union; fall back to the raw code */}
                {STATUS_LABELS[status] ?? status}
              </span>
            ) : null}
          </div>
          <DialogDescription>
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- backend OrderKind can outrun the FE union; fall back to the raw code */}
            {kind ? (ORDER_KIND_LABELS[kind] ?? kind) : 'Order'}
            {order?.orderId ? ` · #${order.orderId.slice(0, 8).toUpperCase()}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="-mr-2 max-h-[70vh] overflow-y-auto pr-2">
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background/40 p-4">
            <div>
              <dt className="text-xs text-muted-foreground">Amount</dt>
              <dd className="mt-0.5 text-sm font-bold text-foreground">
                {typeof totalPaise === 'number' ? formatINR(Math.round(totalPaise / 100)) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Placed on</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {formatDate(order?.createdAt) || '—'}
              </dd>
            </div>
            {detail?.paymentOutcome ? (
              <div>
                <dt className="text-xs text-muted-foreground">Payment</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {detail.paymentOutcome}
                </dd>
              </div>
            ) : null}
            {fulfillment?.courier ? (
              <div>
                <dt className="text-xs text-muted-foreground">Courier</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {fulfillment.courier}
                </dd>
              </div>
            ) : null}
            {fulfillment?.awbNo ? (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Tracking (AWB)</dt>
                <dd className="mt-0.5 font-mono text-sm text-foreground">{fulfillment.awbNo}</dd>
              </div>
            ) : null}
          </dl>

          {fulfillment?.trackingUrl ? (
            <a
              href={fulfillment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-2"
            >
              Track shipment <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}

          {isLoading && !detail ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Loading latest status…
            </div>
          ) : rows.length > 0 ? (
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Shipment progress
              </p>
              <ol className="relative">
                {rows.map((row, index) => {
                  const isLast = index === rows.length - 1;
                  return (
                    <li key={row.title} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[0.6rem]',
                            row.state === 'done'
                              ? 'border-success bg-success text-white'
                              : row.state === 'active'
                                ? 'border-primary text-primary'
                                : 'border-border bg-card text-muted-foreground',
                          )}
                        >
                          {row.state === 'done' ? (
                            <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                          ) : row.state === 'active' ? (
                            '●'
                          ) : (
                            ''
                          )}
                        </span>
                        {!isLast ? (
                          <span
                            className={cn(
                              'w-0.5 flex-1',
                              row.state === 'done' ? 'bg-success' : 'bg-border',
                            )}
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <div className="pb-5">
                        <p
                          className={cn(
                            'text-sm font-bold',
                            row.state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                          )}
                        >
                          {row.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                        {row.time ? (
                          <p className="mt-1 text-[0.7rem] font-semibold text-muted-foreground/80">
                            {row.time}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No shipment updates for this order yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
