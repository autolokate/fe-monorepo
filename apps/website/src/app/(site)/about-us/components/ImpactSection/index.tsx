'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IMPACT_COPY } from './constants';
import styles from './index.module.css';

export function ImpactSection() {
  const { eyebrow, headline, headlineAccent, lines, pivot } = IMPACT_COPY;
  const ref = useRef<HTMLElement>(null);
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
      ref={ref}
      className={[styles.section, visible ? styles.visible : ''].filter(Boolean).join(' ')}
      aria-labelledby="about-impact-heading"
    >
      <div className={styles.bg} aria-hidden="true">
        <Image
          src="/images/about/impact-crash-response-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.bgScrim} />
        <div className={styles.bgVignette} />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id="about-impact-heading" className={styles.headline}>
          {headline}
          <br />
          <span className={styles.headlineAccent}>{headlineAccent}</span>
        </h2>

        <ol className={styles.lines}>
          {lines.map((line, index) => (
            <li
              key={line}
              className={styles.line}
              style={{
                transitionDelay: visible ? `${String(140 + index * 90)}ms` : undefined,
              }}
            >
              {line}
            </li>
          ))}
        </ol>

        <p className={styles.pivot}>{pivot}</p>
      </div>
    </section>
  );
}
