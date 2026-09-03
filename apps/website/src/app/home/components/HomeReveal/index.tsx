'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './index.module.css';

interface HomeRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Subtle scroll-reveal for homepage sections. Respects reduced motion. */
export function HomeReveal({ children, className, delay = 0 }: HomeRevealProps) {
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
      (entries) => {
        if (entries.length > 0 && entries[0].isIntersecting) {
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
      className={[styles.reveal, visible && styles.revealVisible, className]
        .filter(Boolean)
        .join(' ')}
      style={{ transitionDelay: `${String(delay)}ms` }}
    >
      {children}
    </div>
  );
}
