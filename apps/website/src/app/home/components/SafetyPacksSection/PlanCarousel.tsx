"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PURCHASE_ROUTE } from "@/app/(purchase)/purchase/constants";
import { writePurchaseIntent } from "@/app/(purchase)/purchase/storage";
import { useSafetyPlans } from "@/hooks/plans";
import { toSafetyPlan } from "./constants";
import { PlanCard } from "./PlanCard";
import styles from "./index.module.css";

const AUTO_ROTATE_MS = 3800;

type SlotPosition = "left" | "center" | "right";

export function PlanCarousel() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useSafetyPlans();
  const plans = useMemo(() => (data ?? []).map(toSafetyPlan), [data]);

  // Persist the chosen plan + the page the user came from (Home or Pricing) so
  // the purchase flow can preselect the plan and send them back on "back".
  const choosePlan = useCallback(
    (planId: string) => {
      writePurchaseIntent({ plan: planId, from: pathname ?? "/" });
      router.push(PURCHASE_ROUTE);
    },
    [router, pathname],
  );
  const count = plans.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Center on the "popular" plan once the plans arrive from the API.
  useEffect(() => {
    const popularIndex = plans.findIndex((plan) => plan.popular);
    if (popularIndex >= 0) setActive(popularIndex);
  }, [plans]);

  const go = useCallback(
    (direction: number) => {
      setActive((prev) => (prev + direction + count) % count);
    },
    [count],
  );

  // Auto-rotate the cards in a continuous round direction.
  useEffect(() => {
    if (paused || count <= 1) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  if (count === 0) {
    return (
      <div className={styles.stateShell} role="status" aria-live="polite">
        <p className={styles.stateText}>
          {isLoading
            ? "Loading plans…"
            : isError
              ? "We couldn't load plans right now. Please try again shortly."
              : "No plans available right now."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => go(-1)}
        className={`${styles.navButton} ${styles.navPrev}`}
        aria-label="Previous plan"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div className={styles.stage}>
        {plans.map((plan, index) => {
          let offset = index - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const position: SlotPosition =
            offset === 0 ? "center" : offset < 0 ? "left" : "right";
          const isCenter = offset === 0;

          return (
            <div
              key={plan.id}
              className={`${styles.slot} ${styles[position]}`}
              aria-hidden={!isCenter}
            >
              {!isCenter ? (
                <button
                  type="button"
                  className={styles.slotClick}
                  tabIndex={-1}
                  aria-label={`Show ${plan.tierLabel} plan`}
                  onClick={() => setActive(index)}
                />
              ) : null}
              <PlanCard
                plan={plan}
                focused={isCenter}
                onChoose={() => choosePlan(plan.id)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => go(1)}
        className={`${styles.navButton} ${styles.navNext}`}
        aria-label="Next plan"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <div className={styles.dots}>
        {plans.map((plan, index) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setActive(index)}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            aria-label={`Show ${plan.tierLabel} plan`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
