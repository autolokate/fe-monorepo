'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './media-stage.module.css';

export type FeatureMediaVariant = 'utility' | 'garages' | 'safety' | 'garageDashboard';

type FeatureMediaStageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  variant: FeatureMediaVariant;
  priority?: boolean;
  className?: string;
};

const VARIANT_CLASS: Record<FeatureMediaVariant, string> = {
  utility: styles.variant_utility,
  garages: styles.variant_garages,
  safety: styles.variant_safety,
  garageDashboard: styles.variant_garageDashboard,
};

/**
 * Image-aware stage for features visuals.
 * Phone assets use transparent PNG alpha — no solid image background.
 */
export function FeatureMediaStage({
  src,
  alt,
  width,
  height,
  variant,
  priority = false,
  className,
}: FeatureMediaStageProps) {
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
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [reduced]);

  const isPhone = variant === 'utility' || variant === 'garages';

  return (
    <div
      ref={rootRef}
      className={[
        styles.stage,
        VARIANT_CLASS[variant],
        isPhone ? styles.stagePhone : styles.stageScene,
        active ? styles.stageActive : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-variant={variant}
    >
      <span className={styles.glow} aria-hidden="true" />
      {variant === 'safety' ? <span className={styles.pulseRing} aria-hidden="true" /> : null}
      {variant === 'utility' ? (
        <>
          <span className={styles.orb} data-orb="a" aria-hidden="true" />
          <span className={styles.orb} data-orb="b" aria-hidden="true" />
        </>
      ) : null}
      {variant === 'garages' ? (
        <>
          <span className={styles.orb} data-orb="c" aria-hidden="true" />
          <span className={styles.orb} data-orb="d" aria-hidden="true" />
        </>
      ) : null}
      {variant === 'garageDashboard' ? <span className={styles.orbit} aria-hidden="true" /> : null}

      <div className={styles.mediaShell}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={styles.image}
          sizes={
            isPhone ? '(min-width: 900px) 22vw, min(72vw, 16rem)' : '(min-width: 900px) 48vw, 92vw'
          }
        />
      </div>
    </div>
  );
}
