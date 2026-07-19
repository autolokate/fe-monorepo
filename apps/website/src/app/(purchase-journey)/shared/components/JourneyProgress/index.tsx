import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './index.module.css';

/** Ordered checkout milestones shown in the progress rail. */
export const JOURNEY_STEPS = ['Plan', 'Verify', 'Address', 'Pay', 'Done'] as const;

interface JourneyProgressProps {
  /** Zero-based index of the current step (0 = Plan). */
  activeIndex: number;
}

/**
 * Purchase-journey progress rail (Figma "WebCheckoutProgress"). A centered,
 * 5-step stepper on a white bar. Completed steps show a check, the active step
 * shows its number, and upcoming steps are muted.
 */
export function JourneyProgress({ activeIndex }: JourneyProgressProps) {
  return (
    <nav className={styles.bar} aria-label="Checkout progress">
      <ol className={styles.stepper}>
        {JOURNEY_STEPS.map((label, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={label} className={styles.step}>
              <span
                className={cn(styles.marker, (done || active) && styles.markerOn)}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className={styles.check} aria-hidden /> : index + 1}
              </span>
              <span className={cn(styles.label, (done || active) && styles.labelOn)}>{label}</span>
              {index < JOURNEY_STEPS.length - 1 ? (
                <span className={styles.connector} aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
