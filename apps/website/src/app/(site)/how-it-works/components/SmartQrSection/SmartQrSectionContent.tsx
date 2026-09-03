'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SMART_QR_COPY, SMART_QR_STEPS } from './constants';
import { SmartQrFlow } from './SmartQrFlow';
import { SmartQrPhoneStage } from './SmartQrPhoneStage';
import styles from './index.module.css';

const STEP_MS = 2800;

export function SmartQrSectionContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const { eyebrow, headline, headlineAccent, subheading, callout } = SMART_QR_COPY;

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
      setActiveIndex((i) => (i + 1) % SMART_QR_STEPS.length);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [isInView, reduced]);

  const displayIndex = reduced ? SMART_QR_STEPS.length - 1 : activeIndex;

  return (
    <div ref={rootRef} className={styles.grid}>
      <div className={styles.visualCol}>
        <SmartQrPhoneStage activeIndex={displayIndex} />
      </div>

      <div className={styles.contentCol}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="smart-qr-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <SmartQrFlow activeIndex={activeIndex} reduced={reduced} />

        <p className={styles.callout}>
          <span className={styles.calloutIcon} aria-hidden="true" />
          {callout}
        </p>
      </div>
    </div>
  );
}
