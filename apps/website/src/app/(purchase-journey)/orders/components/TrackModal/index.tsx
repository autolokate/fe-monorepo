'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Truck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '@/layouts/Footer/constants';
import { useOrderTracking } from '@/hooks/purchase';
import { SkeletonBar } from '../../../shared/components/Skeleton';
import { buildTimeline, trackBanner } from '../../shared/timeline';
import styles from './index.module.css';

interface TrackModalProps {
  /** The order id (UUID) from the URL. */
  orderNo: string;
}

/**
 * Track-order dialog (Figma "Track (modal)"). Rendered in the orders `@modal`
 * slot when `/orders/[orderNo]/track` is reached via a soft navigation. Closes
 * back to the previous page.
 */
export function TrackModal({ orderNo }: TrackModalProps) {
  const router = useRouter();

  const close = () => {
    router.back();
  };

  // Lock scroll + wire Escape while the dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [router]);

  const { data: order, isError, refetch } = useOrderTracking(orderNo);
  const showLoading = !order && !isError;

  const fulfillment = order?.fulfillment ?? null;
  const rows = buildTimeline(fulfillment ?? {});
  const banner = trackBanner(fulfillment?.status);
  const orderRef = orderNo.slice(0, 8).toUpperCase();

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Track your order">
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={styles.title}>Track your order</h2>
            <p className={styles.subtitle}>Order {orderRef}</p>
          </div>
          <button type="button" className={styles.close} onClick={close} aria-label="Close">
            <X className={styles.closeIcon} aria-hidden />
          </button>
        </div>

        <div className={styles.body}>
          {showLoading ? (
            <>
              <SkeletonBar h={80} radius={18} />
              <div className={styles.card}>
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className={styles.skelStep}>
                    <SkeletonBar w={20} h={20} radius={10} />
                    <div className={styles.skelText}>
                      <SkeletonBar w={150} h={15} />
                      <SkeletonBar w={110} h={12} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isError ? (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>Couldn’t load tracking right now.</p>
              <button type="button" className={styles.retry} onClick={() => void refetch()}>
                Try again
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className={styles.footer}>
          <a className={styles.help} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Need help? Message us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
