'use client';

import type { CSSProperties } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  CONTROL_CENTER_FLOW_HEADING,
  CONTROL_CENTER_FLOW_STEPS,
} from './control-center-flow.constants';
import styles from './control-center-flow-timeline.module.css';

function StepIcon({ type }: { type: (typeof CONTROL_CENTER_FLOW_STEPS)[number]['icon'] }) {
  switch (type) {
    case 'crash':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconSvg}>
          <path
            d="M5 16h2l1.2-3h7.6L17 16h2l-1.8-5H7.8L5 16Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="16.5" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case 'headset':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconSvg}>
          <path
            d="M4 14v-2a8 8 0 0 1 16 0v2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm14 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconSvg}>
          <path
            d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case 'dispatch':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconSvg}>
          <path
            d="m4 12 4-2v8l-4-2Zm6-3 10-5v16l-10-5V9l10-5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconSvg}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="m8.5 12 2 2 5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function ControlCenterFlowTimeline() {
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
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced || !isInView) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % CONTROL_CENTER_FLOW_STEPS.length);
    }, 2600);

    return () => {
      window.clearInterval(id);
    };
  }, [isInView, reduced]);

  const displayIndex = reduced ? CONTROL_CENTER_FLOW_STEPS.length - 1 : activeIndex;

  return (
    <div ref={rootRef} className={styles.timeline} aria-label="Control Center response flow">
      <div className={styles.timelineCard}>
        <h3 className={styles.timelineHeading}>{CONTROL_CENTER_FLOW_HEADING}</h3>

        <ol className={styles.steps}>
          {CONTROL_CENTER_FLOW_STEPS.map((step, index) => {
            const isActive = !reduced && index === displayIndex;
            const isPast = reduced || index < displayIndex;
            const connectorLit = reduced || index < displayIndex;

            return (
              <Fragment key={step.id}>
                <li
                  className={[
                    styles.step,
                    isActive ? styles.stepActive : '',
                    isPast ? styles.stepPast : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ '--step-index': index } as CSSProperties}
                >
                  <span className={styles.iconWrap} aria-hidden="true">
                    <StepIcon type={step.icon} />
                  </span>
                  <div className={styles.stepCopy}>
                    <p className={styles.stepLabel}>{step.label}</p>
                    <p className={styles.stepDetail}>{step.detail}</p>
                  </div>
                </li>

                {index < CONTROL_CENTER_FLOW_STEPS.length - 1 ? (
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
    </div>
  );
}
