'use client';

import { useEffect, useRef, useState } from 'react';
import { ControlCenterVisual } from '@/components/marketing/StoryCinematicVisual';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './control-center-phone-stage.module.css';

export function ControlCenterPhoneStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      setIsLive(true);
      return;
    }
    setIsLive(isInView);
  }, [isInView, reduced]);

  return (
    <div ref={rootRef} className={styles.stage} aria-label="Control Center live response on phone">
      {isLive ? (
        <div className={styles.waveField} aria-hidden="true">
          <span className={styles.waveGlow} />
          <span className={`${styles.wave} ${styles.wave1}`} />
          <span className={`${styles.wave} ${styles.wave2}`} />
          <span className={`${styles.wave} ${styles.wave3}`} />
        </div>
      ) : null}

      <div className={styles.phoneWrap}>
        {isLive ? <span className={styles.trackPulse} aria-hidden="true" /> : null}
        <ControlCenterVisual surface="phone" priority />
      </div>

      <p className={styles.status} aria-live="polite">
        {isLive ? (
          <span className={styles.statusLive}>
            <span className={styles.statusDot} aria-hidden="true" />
            Live response · tracking your location
          </span>
        ) : (
          '24/7 operations team on standby'
        )}
      </p>
    </div>
  );
}
