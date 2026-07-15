'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './index.module.css';

export interface PhoneShot {
  id: string;
  src: string;
  alt: string;
}

interface PhoneCarouselProps {
  shots: PhoneShot[];
  /** Auto-advance interval (mobile only). Defaults to 4s. */
  autoRotateMs?: number;
}

export function PhoneCarousel({ shots, autoRotateMs = 4000 }: PhoneCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  // Auto-advance only in the mobile (single-slide) layout and when motion is allowed.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || shots.length <= 1) return;

    const isDesktop = window.matchMedia('(min-width: 1024px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let timer: number | undefined;
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (paused || isDesktop.matches || reduceMotion.matches) return;
      timer = window.setInterval(() => {
        const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % shots.length;
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
      }, autoRotateMs);
    };

    start();
    isDesktop.addEventListener('change', start);
    return () => {
      stop();
      isDesktop.removeEventListener('change', start);
    };
  }, [shots.length, autoRotateMs, paused]);

  return (
    <div className={styles.carousel}>
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={handleScroll}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {shots.map((shot) => (
          <div key={shot.id} className={styles.slide}>
            <Image
              src={shot.src}
              alt={shot.alt}
              width={691}
              height={1360}
              className={styles.phone}
              sizes="(max-width: 1024px) 70vw, 16rem"
            />
          </div>
        ))}
      </div>

      <div className={styles.dots}>
        {shots.map((shot, index) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => goTo(index)}
            className={`${styles.dot} ${index === active ? styles.dotActive : ''}`}
            aria-label={`Show ${shot.alt}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
