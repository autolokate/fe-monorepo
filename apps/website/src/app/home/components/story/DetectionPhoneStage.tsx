'use client';

import { useEffect, useRef, useState } from 'react';
import { DetectionRadarVisual } from '@/components/marketing/StoryCinematicVisual';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './detection-phone-stage.module.css';

type Phase = 'idle' | 'impact' | 'detect' | 'responding';

const PHASE_MS: Record<Phase, number> = {
  idle: 2200,
  impact: 1100,
  detect: 2400,
  responding: 2800,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  idle: 'impact',
  impact: 'detect',
  detect: 'responding',
  responding: 'idle',
};

export function DetectionPhoneStage({ priority }: { priority?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 'detect' : 'idle');
  const [isInView, setIsInView] = useState(false);

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
    if (reduced || !isInView) {
      setPhase(reduced ? 'detect' : 'idle');
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const tick = (current: Phase) => {
      if (cancelled) return;
      const next = NEXT_PHASE[current];
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setPhase(next);
        tick(next);
      }, PHASE_MS[current]);
    };

    setPhase('idle');
    tick('idle');

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isInView, reduced]);

  const isCrash = phase === 'impact';
  const isAlert = phase === 'impact' || phase === 'detect';
  const isLive = phase === 'responding';

  return (
    <div
      ref={rootRef}
      className={styles.stage}
      data-phase={phase}
      aria-label="Phone detects severe impact and starts emergency response"
    >
      {isAlert ? (
        <div className={styles.waveField} aria-hidden="true">
          <span className={styles.waveGlow} />
          <span className={`${styles.wave} ${styles.wave1}`} />
          <span className={`${styles.wave} ${styles.wave2}`} />
          <span className={`${styles.wave} ${styles.wave3}`} />
          <span className={`${styles.wave} ${styles.wave4}`} />
        </div>
      ) : null}

      <div
        className={[
          styles.phoneWrap,
          isCrash ? styles.phoneCrash : '',
          isAlert ? styles.phoneAlert : '',
          isLive ? styles.phoneLive : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isAlert ? (
          <span className={styles.sosFlash} aria-hidden="true" />
        ) : (
          <span className={styles.monitorPulse} aria-hidden="true" />
        )}

        <DetectionRadarVisual priority={priority} />
      </div>

      <p className={styles.status} aria-live="polite">
        {phase === 'idle' ? (
          'Monitoring every drive'
        ) : phase === 'impact' ? (
          <span className={styles.statusCrash}>Impact detected</span>
        ) : phase === 'detect' ? (
          <span className={styles.statusCrash}>Confirming incident…</span>
        ) : (
          <span className={styles.statusLive}>
            <span className={styles.statusDot} aria-hidden="true" />
            Response sequence started
          </span>
        )}
      </p>
    </div>
  );
}
