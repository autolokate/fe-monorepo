'use client';

import type { CSSProperties } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CRASH_TIMELINE_STEPS } from './constants';
import styles from './flow.module.css';

const STEP_MS = 2800;

export function CrashTimelineFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced || !isInView) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % CRASH_TIMELINE_STEPS.length);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [isInView, reduced]);

  const displayIndex = reduced ? CRASH_TIMELINE_STEPS.length - 1 : activeIndex;
  const progressPct = ((displayIndex + 1) / CRASH_TIMELINE_STEPS.length) * 100;

  return (
    <div ref={rootRef} className={styles.flow} aria-label="Crash response sequence">
      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${String(progressPct)}%` }} />
      </div>

      <p className={styles.progressLabel}>
        Step {displayIndex + 1} of {CRASH_TIMELINE_STEPS.length}
      </p>

      <ol className={styles.steps}>
        {CRASH_TIMELINE_STEPS.map((step, index) => {
          const { Icon } = step;
          const isActive = !reduced && index === displayIndex;
          const isPast = reduced || index < displayIndex;
          const connectorLit = reduced || index < displayIndex;

          return (
            <Fragment key={step.id}>
              <li
                className={[
                  styles.stepCard,
                  step.tone === 'warn' ? styles.stepWarn : '',
                  isActive ? styles.stepActive : '',
                  isPast ? styles.stepPast : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--step-index': index } as CSSProperties}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className={styles.stepRail} aria-hidden="true">
                  <span className={styles.stepIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.iconWrap}>
                    <Icon className={styles.icon} strokeWidth={1.75} aria-hidden />
                  </span>
                </div>

                <div className={styles.stepCopy}>
                  <div className={styles.stepHead}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    {step.badge ? <span className={styles.stepBadge}>{step.badge}</span> : null}
                  </div>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>

                {isActive ? <span className={styles.activePulse} aria-hidden="true" /> : null}
              </li>

              {index < CRASH_TIMELINE_STEPS.length - 1 ? (
                <li
                  className={[styles.connector, connectorLit ? styles.connectorLit : '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
