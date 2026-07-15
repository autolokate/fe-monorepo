'use client';

import { useEffect, useRef, useState } from 'react';
import { Headset, Satellite } from 'lucide-react';
import { PROTECTION_CARDS, PROTECTION_COPY } from './constants';
import { ProtectionCard } from './ProtectionCard';
import styles from './index.module.css';

export function ProtectionCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14 lg:mt-20 lg:pt-16">
      <span
        className={`${styles.amber} font-mono text-[11px] font-semibold uppercase tracking-[0.32em] sm:text-xs`}
      >
        {PROTECTION_COPY.eyebrow}
      </span>

      <h3 className="font-display mt-4 max-w-xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
        {PROTECTION_COPY.headlinePrefix}
        <em className={`${styles.amber} italic`}>{PROTECTION_COPY.headlineEmphasis}</em>
        {PROTECTION_COPY.headlineSuffix}
      </h3>

      <ul
        ref={trackRef}
        className={`${styles.track} mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-3 sm:mt-7`}
      >
        {PROTECTION_CARDS.map((card, index) => (
          <li
            key={card.id}
            style={{ transitionDelay: `${index * 90}ms` }}
            className={`${styles.reveal} ${revealed ? styles.revealIn : ''} min-w-0 shrink-0 basis-[80%] snap-start min-[480px]:basis-[55%] sm:basis-[44%] lg:basis-[calc((100%-3rem)/4)]`}
          >
            <ProtectionCard card={card} />
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
        <span className="inline-flex items-center gap-2">
          <Satellite className={`${styles.amber} h-4 w-4 shrink-0`} strokeWidth={1.9} aria-hidden />
          {PROTECTION_COPY.footnote.source}
        </span>
        <span aria-hidden className="text-border">
          ·
        </span>
        <span className="inline-flex items-center gap-2">
          <Headset className={`${styles.amber} h-4 w-4 shrink-0`} strokeWidth={1.9} aria-hidden />
          {PROTECTION_COPY.footnote.center}
        </span>
      </div>

      <div aria-hidden className="mt-9 border-t border-border sm:mt-10" />
    </div>
  );
}
