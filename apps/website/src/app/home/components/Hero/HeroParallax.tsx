'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './HeroParallax.module.css';

interface HeroParallaxProps {
  children: ReactNode;
}

/** Subtle scroll parallax on hero copy — disabled when reduced motion is preferred. */
export function HeroParallax({ children }: HeroParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;

    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      setOffset(progress * 28);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={styles.wrap}
      style={reduced ? undefined : { transform: `translate3d(0, ${String(offset)}px, 0)` }}
    >
      {children}
    </div>
  );
}
