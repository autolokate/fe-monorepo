'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, Radar, Siren } from 'lucide-react';
import { useCallback, useMemo } from 'react';
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

        <ul className={styles.grid}>
          {plans.map((plan) => (
            <ProtectionPlanCard
              key={plan.id}
              plan={plan}
              highlights={PROTECTION_PLAN_HIGHLIGHTS[plan.id] ?? []}
              onChoose={() => {
                choosePlan(plan.id);
              }}
            />
          ))}
        </ul>

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
