'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MISSION_COPY } from './constants';
import styles from './index.module.css';

export function MissionSection() {
  const { eyebrow, headline, body } = MISSION_COPY;
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
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
    <section
      ref={sectionRef}
      className={[styles.section, visible ? styles.visible : ''].filter(Boolean).join(' ')}
      aria-labelledby="about-mission-heading"
    >
      <div className={styles.inner}>
        <div className={styles.media}>
          <div className={styles.mediaGlow} aria-hidden="true" />
          <div className={styles.mediaFrame}>
            <Image
              src="/images/about/mission-crash-to-dispatch.png"
              alt="Autolokate crash-to-dispatch flow: detect impact, notify family, and dispatch emergency help"
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              className={styles.image}
              priority
            />
            <span className={styles.scanLine} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="about-mission-heading" className={styles.headline}>
            {headline}
          </h2>
          {body.map((paragraph, index) => (
            <p
              key={paragraph}
              className={styles.body}
              style={{
                transitionDelay: visible ? `${String(180 + index * 90)}ms` : undefined,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
