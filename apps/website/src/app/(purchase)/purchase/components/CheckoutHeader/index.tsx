import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/layouts/Header/constants";
import { cn } from "@/lib/utils";
import { PWA_STEPS, STEPPER_LABELS, STEP_TO_STEPPER_INDEX } from "../../constants";
import type { PurchaseStep } from "../../types";
import styles from "./index.module.css";

interface CheckoutHeaderProps {
  step: PurchaseStep;
}

export function CheckoutHeader({ step }: CheckoutHeaderProps) {
  const isPwa = PWA_STEPS.includes(step);
  const activeIndex = STEP_TO_STEPPER_INDEX[step];

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/" aria-label="Go to home" className={styles.brandLink}>
          <Logo className="h-7 w-auto sm:h-8" priority />
        </Link>
      </div>

      <div className={styles.center}>
        {isPwa ? (
          <span className={styles.pwaBadge}>PWA · After delivery · Scan-to-activate</span>
        ) : (
          <ol className={styles.stepper} aria-label="Checkout progress">
            {STEPPER_LABELS.map((label, index) => {
              const done = index < activeIndex;
              const active = index === activeIndex;
              return (
                <li key={label} className={styles.step}>
                  <span
                    className={cn(
                      styles.dot,
                      done && styles.dotDone,
                      active && styles.dotActive,
                    )}
                  >
                    {done ? (
                      <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      styles.stepLabel,
                      (done || active) && styles.stepLabelOn,
                    )}
                  >
                    {label}
                  </span>
                  {index < STEPPER_LABELS.length - 1 ? (
                    <span className={styles.divider} aria-hidden>
                      —
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </header>
  );
}
