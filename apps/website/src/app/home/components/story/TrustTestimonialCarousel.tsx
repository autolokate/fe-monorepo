'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TRUST_TESTIMONIALS } from './constants';
import { TrustTestimonialCard } from './TrustTestimonialCard';
import styles from './trust-carousel.module.css';

const AUTO_ADVANCE_MS = 7000;

export function TrustTestimonialCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const count = TRUST_TESTIMONIALS.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const recenter = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const card = track.children[active] as HTMLElement | undefined;
    if (!card) return;
    const offset = viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
    track.style.transform = `translate3d(${String(offset)}px, 0, 0)`;
  }, [active]);

  useLayoutEffect(() => {
    recenter();
  }, [recenter]);

  useEffect(() => {
    window.addEventListener('resize', recenter);
    return () => {
      window.removeEventListener('resize', recenter);
    };
  }, [recenter]);

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [paused, count]);

  const go = useCallback(
    (index: number) => {
      if (count <= 0) return;
      const wrapped = ((index % count) + count) % count;
      setActive(wrapped);
    },
    [count],
  );

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      onFocusCapture={() => {
        setPaused(true);
      }}
      onBlurCapture={() => {
        setPaused(false);
      }}
    >
      <div ref={viewportRef} className={styles.viewport}>
        <ul ref={trackRef} className={styles.track}>
          {TRUST_TESTIMONIALS.map((testimonial, index) => (
            <li key={testimonial.id} className={styles.slide} aria-hidden={index !== active}>
              <TrustTestimonialCard testimonial={testimonial} featured={index === active} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Previous story"
          onClick={() => {
            go(active - 1);
          }}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>

        <div className={styles.dots} role="tablist" aria-label="Customer stories">
          {TRUST_TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              role="tab"
              onClick={() => {
                go(index);
              }}
              className={`${styles.dot} ${index === active ? styles.dotActive : ''}`}
              aria-label={`Show story from ${testimonial.name}`}
              aria-selected={index === active}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.arrow}
          aria-label="Next story"
          onClick={() => {
            go(active + 1);
          }}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
