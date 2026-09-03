'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PARTNERS, PARTNERS_HEADER } from './constants';
import styles from './partners.module.css';

function PartnerRow({ app, active }: { app: (typeof PARTNERS)[number]; active: boolean }) {
  const visual = (
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.glow} />
      <div className={styles.mediaShell}>
        <Image
          src={app.image}
          alt=""
          width={1536}
          height={1024}
          className={styles.image}
          sizes="(min-width: 1024px) 48vw, 94vw"
        />
      </div>
    </div>
  );

  const copy = (
    <div className={styles.copy}>
      <div className={styles.titleRow}>
        <span className={styles.iconWrap}>
          <Image src={app.icon} alt="" width={60} height={60} className={styles.icon} />
        </span>
        <div>
          <h3 className={styles.name}>{app.name}</h3>
          <p className={styles.audience}>{app.audience}</p>
        </div>
      </div>

      <ul className={styles.capabilities}>
        {app.capabilities.map((item) => {
          const Icon = item.Icon;
          return (
            <li key={item.id} className={styles.capability}>
              <span className={styles.capabilityIcon} aria-hidden="true">
                <Icon className={styles.capabilityLucide} strokeWidth={1.75} />
              </span>
              <span className={styles.capabilityText}>
                <span className={styles.capabilityLabel}>{item.label}</span>
                <span className={styles.capabilityDetail}>{item.detail}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <Link href={app.cta.href} className={styles.cta} target="_blank" rel="noopener noreferrer">
        {app.cta.label}
        <ArrowRight className={styles.ctaArrow} aria-hidden />
      </Link>
    </div>
  );

  return (
    <article
      className={[
        styles.row,
        app.layout === 'copy-first' ? styles.rowReversed : '',
        active ? styles.rowActive : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {app.layout === 'visual-first' ? (
        <>
          {visual}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {visual}
        </>
      )}
      <span className="sr-only">{app.imageAlt}</span>
    </article>
  );
}

export function PartnerApps() {
  const { eyebrow, headline, headlineLine2, body } = PARTNERS_HEADER;
  const rootRef = useRef<HTMLElement>(null);
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
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className={[styles.section, active ? styles.sectionActive : ''].filter(Boolean).join(' ')}
      aria-labelledby="partners-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="partners-heading" className={styles.headline}>
            {headline}
            <br />
            <span className={styles.headlineMuted}>{headlineLine2}</span>
          </h2>
          <p className={styles.body}>{body}</p>
        </header>

        <div className={styles.rows}>
          {PARTNERS.map((app) => (
            <PartnerRow key={app.id} app={app} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
