'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Package } from 'lucide-react';
import { WHATSAPP_URL } from '@/layouts/Footer/constants';
import { useDownloadInvoice, useOrders } from '@/hooks/purchase';
import { isPurchaseAuthenticated } from '@/services/purchase';
import { JourneyHeader } from '../../../shared/components/JourneyHeader';
import { JourneyError } from '../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../shared/routes';
import { OrderCard } from '../OrderCard';
import { OrdersSkeleton } from '../OrdersSkeleton';
import styles from './index.module.css';

export function OrdersView() {
  const router = useRouter();

  // "My orders" needs a live purchase session; bounce guests to the plan picker.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (isPurchaseAuthenticated()) setAuthed(true);
    else router.replace(JOURNEY_ROUTES.buy);
  }, [router]);

  // `useOrders` seeds `initialData: []`, so gate the states off settle flags.
  // Show the skeleton from the very first paint (before auth resolves + while
  // fetching) so there's no blank flash.
  const { data: orders = [], isError, isSuccess, refetch } = useOrders(20, authed);
  const showLoading = !isSuccess && !isError;
  const isEmpty = isSuccess && orders.length === 0;

  const [pendingInvoice, setPendingInvoice] = useState<string | null>(null);
  const downloadInvoice = useDownloadInvoice({
    errorToast: true,
    successToast: 'Opening your invoice',
  });

  const handleInvoice = (orderId: string) => {
    setPendingInvoice(orderId);
    void downloadInvoice
      .mutateAsync(orderId)
      .catch(() => {})
      .finally(() => {
        setPendingInvoice(null);
      });
  };

  return (
    <div className={styles.page}>
      <JourneyHeader />

      <div className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>My orders</h1>
          <p className={styles.sub}>Track and manage your orders</p>
        </div>

        {showLoading ? (
          <div className={styles.list}>
            <OrdersSkeleton />
          </div>
        ) : isError ? (
          <div className={styles.stateWrap}>
            <JourneyError title="Couldn’t load your orders" onRetry={() => void refetch()} />
          </div>
        ) : isEmpty ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Package className={styles.emptyGlyph} aria-hidden />
            </span>
            <div className={styles.emptyText}>
              <h2 className={styles.emptyTitle}>No orders yet</h2>
              <p className={styles.emptySub}>Your orders will show up here once you buy a plan</p>
            </div>
            <button
              type="button"
              className={styles.browseBtn}
              onClick={() => {
                router.push(JOURNEY_ROUTES.buy);
              }}
            >
              Browse plans
              <ArrowRight className={styles.browseIcon} aria-hidden />
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                invoiceLoading={pendingInvoice === order.orderId && downloadInvoice.isLoading}
                onTrack={(id) => {
                  router.push(JOURNEY_ROUTES.orderTrack(id));
                }}
                onInvoice={handleInvoice}
                onUpgrade={() => {
                  router.push(JOURNEY_ROUTES.buy);
                }}
                onRetry={(id) => {
                  router.push(JOURNEY_ROUTES.orderStatus(id));
                }}
                onGetHelp={() => window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
