'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './reveal.module.css';

type FeaturesRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

/** Scroll-triggered reveal for features page blocks. Respects reduced motion. */
export function FeaturesReveal({ children, className, delayMs = 0 }: FeaturesRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={[styles.reveal, visible ? styles.revealVisible : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ transitionDelay: `${String(delayMs)}ms` }}
    >
      {children}
    </div>
  );
}
