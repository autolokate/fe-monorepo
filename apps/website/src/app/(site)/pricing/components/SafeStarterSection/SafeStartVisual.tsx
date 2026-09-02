'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { STARTER_VISUAL_IMAGE } from './constants';
import styles from './visual-stage.module.css';

export function SafeStartVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (reduced) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0.28 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className={[styles.stage, active ? styles.stageActive : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <span className={styles.glow} />
      <span className={styles.spark} data-spark="a" />
      <span className={styles.spark} data-spark="b" />
      <span className={styles.spark} data-spark="c" />

      <div className={styles.mediaShell}>
        <div className={styles.mediaInner}>
          <Image
            src={STARTER_VISUAL_IMAGE}
            alt=""
            width={1536}
            height={1024}
            className={styles.image}
            sizes="(min-width: 1024px) 48vw, 92vw"
          />

          {/* Soft scan over the Smart QR face on the retail pack */}
          <div className={styles.qrScanZone}>
            <span className={styles.qrCorner} data-corner="tl" />
            <span className={styles.qrCorner} data-corner="tr" />
            <span className={styles.qrCorner} data-corner="bl" />
            <span className={styles.qrCorner} data-corner="br" />
            <span className={styles.qrWash} />
            <span className={styles.qrScanBeam} />
          </div>

          {/* Soft pulse over the Active badge on the phone UI */}
          <span className={styles.activePulse} />
        </div>
      </div>
    </div>
  );
}
