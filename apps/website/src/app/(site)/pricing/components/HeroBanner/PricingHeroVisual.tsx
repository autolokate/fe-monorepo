'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HERO_VISUAL_IMAGE } from './constants';
import styles from './visual-stage.module.css';

export function PricingHeroVisual() {
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
      { threshold: 0.25 },
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
      <span className={styles.ring} />
      <span className={styles.ringSoft} />
      <span className={styles.spark} data-spark="a" />
      <span className={styles.spark} data-spark="b" />
      <span className={styles.spark} data-spark="c" />

      <div className={styles.mediaShell}>
        <div className={styles.mediaInner}>
          <Image
            src={HERO_VISUAL_IMAGE}
            alt=""
            width={1536}
            height={1024}
            priority
            className={styles.image}
            sizes="(min-width: 1024px) 42vw, 92vw"
          />

          {/* Scan animation targeted to the Smart QR card (right side of the shot) */}
          <div className={styles.qrScanZone}>
            <span className={styles.qrCorner} data-corner="tl" />
            <span className={styles.qrCorner} data-corner="tr" />
            <span className={styles.qrCorner} data-corner="bl" />
            <span className={styles.qrCorner} data-corner="br" />
            <span className={styles.qrWash} />
            <span className={styles.qrScanBeam} />
          </div>
        </div>
      </div>
    </div>
  );
}
