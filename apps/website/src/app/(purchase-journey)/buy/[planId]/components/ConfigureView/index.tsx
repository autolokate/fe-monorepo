'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { JourneyHeader } from '../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../shared/components/JourneyProgress';
import { JourneyError } from '../../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../../shared/routes';
import { patchJourneyState } from '../../../../shared/storage';
import { usePlans } from '../../../../shared/hooks/usePlans';
import { formatRupees, getPlanVisual } from '../../../../shared/plans';
import { RiderOption } from '../RiderOption';
import { ConfigureSkeleton } from '../ConfigureSkeleton';
import styles from './index.module.css';

interface ConfigureViewProps {
  /** Plan id (UUID) from the URL. */
  planId: string;
}

export function ConfigureView({ planId }: ConfigureViewProps) {
  const router = useRouter();
  const { plans, isLoading, isError, retry } = usePlans();

  const plan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);

  const riderOptions = useMemo(
    () =>
      (plan?.riderOptions ?? [])
        .filter((o) => o.riderCount > 0)
        .sort((a, b) => a.riderCount - b.riderCount),
    [plan],
  );

  const [selectedCount, setSelectedCount] = useState<number | null>(null);

  // Load finished but the slug matches no plan → back to the picker.
  const notFound = !isLoading && !isError && !plan;
  useEffect(() => {
    if (notFound) router.replace(JOURNEY_ROUTES.buy);
  }, [notFound, router]);

  const selectedOption = riderOptions.find((o) => o.riderCount === selectedCount) ?? null;
  const basePaise = plan?.pricePaise ?? 0;
  const totalPaise = basePaise + (selectedOption?.pricePaise ?? 0);
  const periodSuffix = plan?.period === 'MONTHLY' ? '/month' : '/year';
  const periodLabel = plan?.period === 'MONTHLY' ? '1-month cover' : '1-year cover';
  const planSubtitle = `${periodLabel} · ${plan?.includesLabel ?? 'Smart QR kit included'}`;

  const ctaLabel = selectedOption
    ? `Add ${String(selectedOption.riderCount)} rider${selectedOption.riderCount > 1 ? 's' : ''} · ${formatRupees(
        selectedOption.pricePaise,
      )}`
    : "Skip, I'll ride solo";

  const handleContinue = () => {
    patchJourneyState({ planId, planTier: plan?.tier, riderCount: selectedCount ?? 0 });
    router.push(JOURNEY_ROUTES.verify(planId));
  };

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={0} />

      {isError ? (
        <div className={styles.errorBody}>
          <JourneyError title="Couldn't load rider prices" onRetry={retry} />
        </div>
      ) : (
        <div className={styles.body}>
          <Link href={JOURNEY_ROUTES.buy} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </Link>

          <div className={styles.hd}>
            <h1 className={styles.title}>Bring someone under your cover</h1>
            <p className={styles.subhead}>
              Add ₹1L accident cover for a family member or friend who rides with you. Skip if it’s
              just you.
            </p>
          </div>

          {plan && !notFound ? (
            <>
              <div className={styles.order}>
                <span className={styles.eyebrow}>YOUR ORDER</span>

                <div className={styles.planRow}>
                  <div className={styles.planLeft}>
                    <span className={styles.tile}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- static Figma-exported SVG glyph */}
                      <img
                        className={styles.tileIcon}
                        src={getPlanVisual(plan.tier).iconSrc}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                    </span>
                    <div className={styles.planText}>
                      <div className={styles.nameRow}>
                        <span className={styles.planName}>{plan.name}</span>
                        <Link href={JOURNEY_ROUTES.buy} className={styles.change}>
                          Change
                        </Link>
                      </div>
                      <span className={styles.planSub}>{planSubtitle}</span>
                    </div>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatRupees(basePaise)}</span>
                    <span className={styles.per}>{periodSuffix}</span>
                  </div>
                </div>

                {riderOptions.length > 0 ? (
                  <div className={styles.addonGroup}>
                    <div className={styles.addonLabel}>
                      <span className={styles.addonTitle}>Add rider cover</span>
                      <span className={styles.addonOptional}>optional</span>
                    </div>
                    {riderOptions.map((option) => (
                      <RiderOption
                        key={option.riderCount}
                        option={option}
                        selected={selectedCount === option.riderCount}
                        onToggle={() => {
                          setSelectedCount((prev) =>
                            prev === option.riderCount ? null : option.riderCount,
                          );
                        }}
                      />
                    ))}
                  </div>
                ) : null}

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>You’ll pay</span>
                  <div className={styles.totalRight}>
                    <div className={styles.totalPriceRow}>
                      <span className={styles.totalPrice}>{formatRupees(totalPaise)}</span>
                      <span className={styles.per}>{periodSuffix}</span>
                    </div>
                    <span className={styles.gst}>GST included</span>
                  </div>
                </div>
              </div>

              <p className={styles.note}>You’ll add their name and details after payment</p>

              <button type="button" className={styles.cta} onClick={handleContinue}>
                {ctaLabel}
                <ArrowRight className={styles.ctaIcon} aria-hidden />
              </button>
            </>
          ) : (
            <ConfigureSkeleton />
          )}
        </div>
      )}
    </div>
  );
}
