'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, QrCode, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '@/layouts/Footer/constants';
import { useOrderTracking } from '@/hooks/purchase';
import { isPurchaseAuthenticated } from '@/services/purchase';
import { JourneyHeader } from '../../../../../shared/components/JourneyHeader';
import { JourneyError } from '../../../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../../../shared/routes';
import { buildTimeline, trackBanner } from '../../../../shared/timeline';
import { TrackSkeleton } from '../TrackSkeleton';
import styles from './index.module.css';

interface OrderTrackViewProps {
  /** The order id (UUID) from the URL. */
  orderNo: string;
}

export function OrderTrackView({ orderNo }: OrderTrackViewProps) {
  const router = useRouter();

  // Tracking needs a live purchase session; bounce guests to the plan picker.
  useEffect(() => {
    if (!isPurchaseAuthenticated()) router.replace(JOURNEY_ROUTES.buy);
  }, [router]);

  // `useOrderTracking` seeds `initialData: null`, so `isLoading` never flips —
  // drive the states off the resolved `order` + `isError` instead.
  const { data: order, isError, refetch } = useOrderTracking(orderNo);
  const showError = isError && !order;
  const showLoading = !order && !isError;

  const fulfillment = order?.fulfillment ?? null;
  const rows = buildTimeline(fulfillment ?? {});

  const orderRef = `#${orderNo.slice(0, 8).toUpperCase()}`;
  const banner = trackBanner(fulfillment?.status);

  return (
    <div className={styles.page}>
      <JourneyHeader />

      <div className={styles.body}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => {
            router.push(JOURNEY_ROUTES.orderStatus(orderNo));
          }}
        >
          <ArrowLeft className={styles.backIcon} aria-hidden />
          Back
        </button>

        <div className={styles.col}>
          {showError ? (
            <>
              <div className={styles.head}>
                <h1 className={styles.title}>Track your order</h1>
                <p className={styles.sub}>Order {orderRef} · Smart QR kit</p>
              </div>
              <div className={styles.errorWrap}>
                <JourneyError title="Couldn’t load tracking" onRetry={() => void refetch()} />
              </div>
            </>
          ) : showLoading ? (
            <TrackSkeleton />
          ) : (
            <>
              <div className={styles.head}>
                <h1 className={styles.title}>Track your order</h1>
                <p className={styles.sub}>Order {orderRef} · Smart QR kit</p>
              </div>

              <div className={styles.banner}>
                <span className={styles.bannerIcon}>
                  <Truck className={styles.bannerGlyph} aria-hidden />
                </span>
                <div className={styles.bannerText}>
                  <span className={styles.bannerTitle}>{banner.title}</span>
                  <span className={styles.bannerSub}>{banner.sub}</span>
                </div>
              </div>

              <div className={styles.card}>
                {rows.map((row, index) => {
                  const isFirst = index === 0;
                  const isLast = index === rows.length - 1;
                  const on = row.state === 'done' || row.state === 'active';
                  return (
                    <div key={row.title} className={styles.step}>
                      <div className={styles.rail}>
                        <span
                          className={cn(
                            styles.seg,
                            isFirst ? styles.segNone : on ? styles.segGreen : styles.segGrey,
                          )}
                        />
                        <span className={cn(styles.dot, on ? styles.dotOn : styles.dotOff)}>
                          {on ? <Check className={styles.dotIcon} aria-hidden /> : null}
                        </span>
                        <span
                          className={cn(
                            styles.seg,
                            isLast
                              ? styles.segNone
                              : row.state === 'done'
                                ? styles.segGreen
                                : styles.segGrey,
                          )}
                        />
                      </div>
                      <div className={styles.content}>
                        <p
                          className={cn(
                            styles.rowTitle,
                            row.state === 'pending' && styles.rowTitleMuted,
                          )}
                        >
                          {row.title}
                        </p>
                        {row.desc ? <p className={styles.rowDesc}>{row.desc}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.activate}>
                <QrCode className={styles.activateIcon} aria-hidden />
                <span className={styles.activateText}>
                  When it arrives, scan the QR to activate your cover
                </span>
              </div>

              <a
                className={styles.help}
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Need help? Message us on WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
