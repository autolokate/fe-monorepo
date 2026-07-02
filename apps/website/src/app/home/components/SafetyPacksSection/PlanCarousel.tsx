"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SAFETY_PLANS } from "./constants";
import { PlanCard } from "./PlanCard";
import styles from "./index.module.css";

const AUTO_ROTATE_MS = 3800;

type SlotPosition = "left" | "center" | "right";

export function PlanCarousel() {
  const router = useRouter();
  const plans = SAFETY_PLANS;
  const count = plans.length;
  const popularIndex = plans.findIndex((plan) => plan.popular);
  const [active, setActive] = useState(popularIndex >= 0 ? popularIndex : 0);
  const [paused, setPaused] = useState(false);

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
                onChoose={() => router.push(plan.ctaHref)}
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
