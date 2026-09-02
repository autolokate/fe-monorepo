'use client';

import type { CSSProperties } from 'react';
import { Fragment } from 'react';
import { SMART_QR_STEPS } from './constants';
import styles from './flow.module.css';

interface SmartQrFlowProps {
  activeIndex: number;
  reduced: boolean;
}

export function SmartQrFlow({ activeIndex, reduced }: SmartQrFlowProps) {
  const displayIndex = reduced ? SMART_QR_STEPS.length - 1 : activeIndex;
  const progressPct = ((displayIndex + 1) / SMART_QR_STEPS.length) * 100;

  return (
    <div className={styles.flow} aria-label="Smart QR backup flow">
      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${String(progressPct)}%` }} />
      </div>

      <p className={styles.progressLabel}>
        Step {displayIndex + 1} of {SMART_QR_STEPS.length}
      </p>

      <ol className={styles.steps}>
        {SMART_QR_STEPS.map((step, index) => {
          const { Icon } = step;
          const isActive = !reduced && index === displayIndex;
          const isPast = reduced || index < displayIndex;
          const connectorLit = reduced || index < displayIndex;
          const toneClass =
            step.tone === 'emergency'
              ? styles.stepEmergency
              : step.tone === 'calm'
                ? styles.stepCalm
                : '';

          return (
            <Fragment key={step.id}>
              <li
                className={[
                  styles.stepCard,
                  toneClass,
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

              {index < SMART_QR_STEPS.length - 1 ? (
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
