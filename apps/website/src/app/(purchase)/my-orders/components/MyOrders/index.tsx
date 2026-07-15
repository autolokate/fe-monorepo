'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Package, RefreshCw } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { Logo } from '@/layouts/Header/constants';
import { cn, formatINR } from '@/lib/utils';
import { useOrders, usePurchaseProfile } from '@/hooks/purchase';
import {
  isAccessTokenLive,
  isPurchaseAuthenticated,
  refreshPurchaseSession,
} from '@/services/purchase';
import type { OrderStatus, OrderSummary } from '@/services/purchase';
import { OrderDetailDialog } from './OrderDetailDialog';
import { ORDER_KIND_LABELS, STATUS_LABELS, formatDate } from './format';
import styles from './index.module.css';

function statusClass(status: OrderStatus): string {
  if (status === 'PAID') return styles.pillPaid;
  if (status === 'FAILED' || status === 'CANCELLED') return styles.pillFailed;
  return styles.pillPending;
}

function OrderRow({
  order,
  onSelect,
}: {
  order: OrderSummary;
  onSelect: (order: OrderSummary) => void;
}) {
  const fulfillment = order.fulfillment ?? null;
  const shipStatus = fulfillment?.status;

  return (
    <li>
      <button
        type="button"
        className={styles.card}
        onClick={() => onSelect(order)}
        aria-label={`View details for ${order.planName} order`}
      >
        <div className={styles.cardHead}>
          <div className={styles.plan}>
            <span className={styles.planIcon} aria-hidden>
              <Package className="h-4 w-4" />
            </span>
            <div>
              <p className={styles.planName}>{order.planName}</p>
              <p className={styles.kind}>{ORDER_KIND_LABELS[order.orderKind] ?? order.orderKind}</p>
            </div>
          </div>
          <span className={cn(styles.pill, statusClass(order.status))}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.amount}>{formatINR(Math.round(order.totalPaise / 100))}</span>
          {order.createdAt ? (
            <span className={styles.date}>{formatDate(order.createdAt)}</span>
          ) : null}
          <span className={styles.ref}>#{order.orderId.slice(0, 8).toUpperCase()}</span>
        </div>

        {shipStatus ? (
          <div className={styles.ship}>
            <span className={styles.shipStatus}>
              {shipStatus === 'DELIVERED'
                ? `Delivered${fulfillment?.deliveredAt ? ` · ${formatDate(fulfillment.deliveredAt)}` : ''}`
                : shipStatus === 'SHIPPED' || shipStatus === 'IN_TRANSIT'
                  ? `In transit${fulfillment?.courier ? ` · ${fulfillment.courier}` : ''}`
                  : shipStatus === 'PAID'
                    ? 'Preparing your kit'
                    : shipStatus}
            </span>
            {fulfillment?.awbNo ? (
              <span className={styles.awb}>AWB {fulfillment.awbNo}</span>
            ) : null}
            <span className={styles.viewDetail} aria-hidden>
              View details
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          <div className={styles.ship}>
            <span className={styles.viewDetail} aria-hidden>
              View details
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </button>
    </li>
  );
}

export function MyOrders() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [selected, setSelected] = useState<OrderSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (order: OrderSummary) => {
    setSelected(order);
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!isPurchaseAuthenticated()) {
      router.replace('/purchase');
      return;
    }
    // Short-lived access token may have lapsed — mint a fresh one up front so the
    // first read doesn't have to 401 + retry.
    if (!isAccessTokenLive()) void refreshPurchaseSession();
    setAuthed(true);
    setHydrated(true);
  }, [router]);

  const { data: profile, isLoading: profileLoading } = usePurchaseProfile(authed);
  const {
    data: orders,
    isLoading: ordersLoading,
    isError,
    refetch,
    isFetching,
  } = useOrders(20, authed);

  if (!hydrated || !authed) {
    return (
      <div className={styles.loading}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const firstName = profile?.name?.trim().split(' ')[0] || 'there';
  const list = orders ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Go to home" className={styles.brandLink}>
          <Logo className="h-7 w-auto sm:h-8" priority />
        </Link>
        <Link href="/purchase" className={styles.buyLink}>
          Buy a plan
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={cn(styles.title, 'font-display')}>
            Hi {profileLoading ? '…' : firstName}
          </h1>
          <p className={styles.subtitle}>Your previous orders are listed below.</p>
        </div>

        {ordersLoading ? (
          <div className={styles.state}>
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
            Fetching your orders…
          </div>
        ) : isError ? (
          <div className={styles.state}>
            <p className={styles.stateText}>We couldn&apos;t load your orders just now.</p>
            <AlButton
              size="sm"
              radius="lg"
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" aria-hidden />}
              onClick={() => void refetch()}
            >
              Try again
            </AlButton>
          </div>
        ) : list.length === 0 ? (
          <div className={styles.state}>
            <p className={styles.stateText}>You haven&apos;t placed any orders yet.</p>
            <AlButton
              size="sm"
              radius="lg"
              variant="primary"
              onClick={() => router.push('/purchase')}
            >
              Browse plans
            </AlButton>
          </div>
        ) : (
          <ul className={styles.list}>
            {list.map((order) => (
              <OrderRow key={order.orderId} order={order} onSelect={openDetail} />
            ))}
          </ul>
        )}

        {!ordersLoading && list.length > 0 ? (
          <button
            type="button"
            className={styles.refresh}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        ) : null}
      </main>

      <OrderDetailDialog order={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
