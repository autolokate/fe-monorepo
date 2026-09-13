'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, QrCode, Radar, Siren } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PURCHASE_ROUTE } from '@/app/(purchase)/purchase/constants';
import { writePurchaseIntent } from '@/app/(purchase)/purchase/storage';
import { useSafetyPlans } from '@/hooks/plans';
import {
  FALLBACK_SAFETY_PLANS,
  SAFETY_PACKS_SECTION_ID,
  toSafetyPlan,
} from '../SafetyPacksSection/constants';
import { PROTECTION_COPY, PROTECTION_PLAN_HIGHLIGHTS } from './constants';
import { ProtectionPlanCard } from './ProtectionPlanCard';
import styles from './protection.module.css';

const INCLUDE_ICONS = [Radar, Siren, QrCode] as const;

export function ProtectionMomentSection() {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useSafetyPlans();
  const gridRef = useRef<HTMLUListElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(1); // Default to middle/popular (Guardian)

  const plans = useMemo(() => {
    const live = (data ?? []).map(toSafetyPlan);
    return live.length > 0 ? live : FALLBACK_SAFETY_PLANS;
  }, [data]);

  const choosePlan = useCallback(
    (planId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- usePathname() can be null in practice
      writePurchaseIntent({ plan: planId, from: pathname ?? '/' });
      router.push(PURCHASE_ROUTE);
    },
    [router, pathname],
  );

  const scrollToIndex = useCallback((index: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const targetCard = grid.children.item(index) as HTMLElement | null;
    if (!targetCard) return;
    grid.scrollTo({
      left: targetCard.offsetLeft - grid.offsetLeft,
      behavior: 'smooth',
    });
    setActiveCardIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    const nextIdx = Math.max(0, activeCardIndex - 1);
    scrollToIndex(nextIdx);
  }, [activeCardIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = Math.min(plans.length - 1, activeCardIndex + 1);
    scrollToIndex(nextIdx);
  }, [activeCardIndex, plans.length, scrollToIndex]);

  // Track scroll position on mobile to sync active dot indicator
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const cards = Array.from(grid.children) as HTMLElement[];
          if (cards.length === 0) return;
          const scrollCenter = grid.scrollLeft + grid.clientWidth / 2;
          let closestIndex = 0;
          let minDiff = Infinity;
          cards.forEach((card, idx) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const diff = Math.abs(scrollCenter - cardCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = idx;
            }
          });
          setActiveCardIndex(closestIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    grid.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      grid.removeEventListener('scroll', onScroll);
    };
  }, [plans.length]);

  const {
    eyebrow,
    headline,
    headlineAccent,
    body,
    headerPill,
    compareHref,
    compareLabel,
    footnotes,
    includes,
  } = PROTECTION_COPY;

  return (
    <section
      id={SAFETY_PACKS_SECTION_ID}
      className={styles.section}
      aria-labelledby="protection-heading"
    >
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="protection-heading" className={styles.headline}>
            {headline} <span className={styles.accent}>{headlineAccent}</span>
          </h2>

          <p className={styles.body}>{body}</p>

          <p className={styles.headerPill}>{headerPill}</p>

          <ul className={styles.includes}>
            {includes.map((item, index) => {
              const Icon = INCLUDE_ICONS[index] ?? Radar;
              return (
                <li key={item.label} className={styles.includeChip}>
                  <Icon className={styles.includeIcon} strokeWidth={1.75} aria-hidden />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </header>

        <div className={styles.plansContainer}>
          <ul ref={gridRef} className={styles.grid}>
            {plans.map((plan, idx) => (
              <ProtectionPlanCard
                key={plan.id}
                plan={plan}
                isActive={idx === activeCardIndex}
                highlights={PROTECTION_PLAN_HIGHLIGHTS[plan.id] ?? []}
                onChoose={() => {
                  choosePlan(plan.id);
                }}
              />
            ))}
          </ul>

          {/* Mobile carousel controls */}
          <div className={styles.mobileControls} aria-label="Protection plans navigation">
            <button
              type="button"
              className={styles.carouselNavBtn}
              onClick={handlePrev}
              disabled={activeCardIndex === 0}
              aria-label="Previous plan"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>

            <div className={styles.carouselDots} role="tablist" aria-label="Plan indicators">
              {plans.map((plan, idx) => (
                <button
                  key={plan.id}
                  type="button"
                  role="tab"
                  className={`${styles.carouselDot} ${idx === activeCardIndex ? styles.carouselDotActive : ''}`}
                  onClick={() => {
                    scrollToIndex(idx);
                  }}
                  aria-label={`View ${plan.tierLabel} plan`}
                  aria-selected={idx === activeCardIndex}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.carouselNavBtn}
              onClick={handleNext}
              disabled={activeCardIndex === plans.length - 1}
              aria-label="Next plan"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <footer className={styles.footer}>
          <ul className={styles.footnotes}>
            {footnotes.map((note) => (
              <li key={note} className={styles.footnote}>
                {note}
              </li>
            ))}
          </ul>

          <Link href={compareHref} className={styles.compareLink}>
            {compareLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </div>
    </section>
  );
}
