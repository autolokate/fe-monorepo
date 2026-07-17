'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from './constants';
import { TestimonialCard } from './TestimonialCard';
import styles from './index.module.css';

export function TestimonialCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const count = TESTIMONIALS.length;
  const [active, setActive] = useState(Math.min(1, count - 1));

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

  const go = useCallback(
    (index: number) => {
      setActive(Math.max(0, Math.min(index, count - 1)));
    },
    [count],
  );

  return (
    <div className={styles.carousel}>
      <div ref={viewportRef} className={styles.viewport}>
        <ul ref={trackRef} className={styles.track}>
          {TESTIMONIALS.map((testimonial, index) => (
            <li key={testimonial.id} className={styles.slide} aria-hidden={index !== active}>
              <TestimonialCard testimonial={testimonial} featured={index === active} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Previous testimonial"
          disabled={active === 0}
          onClick={() => {
            go(active - 1);
          }}
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>

        <div className={styles.dots}>
          {TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => {
                go(index);
              }}
              className={`${styles.dot} ${index === active ? styles.dotActive : ''}`}
              aria-label={`Show testimonial from ${testimonial.name}`}
              aria-current={index === active}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.arrow}
          aria-label="Next testimonial"
          disabled={active === count - 1}
          onClick={() => {
            go(active + 1);
          }}
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
