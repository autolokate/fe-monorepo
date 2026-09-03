'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FLAGSHIP } from './constants';
import styles from './flagship.module.css';

const STEP_MS = 2200;
const RESUME_MS = 4500;

/** Soft glow anchors aligned to callouts in flagship-app-v2.png */
const HOTSPOTS = [
  { id: 'crash', left: '18%', top: '26%', caps: ['crash-detection'] },
  { id: 'family', left: '16%', top: '48%', caps: ['crash-detection'] },
  { id: 'tools', left: '82%', top: '42%', caps: ['everyday-tools'] },
  { id: 'score', left: '80%', top: '62%', caps: ['driver-score'] },
  { id: 'qr', left: '78%', top: '24%', caps: ['smart-qr'] },
  { id: 'vehicles', left: '50%', top: '72%', caps: ['multi-vehicle'] },
] as const;

export function FlagshipMoment() {
  const { name, audience, capabilities, cta, icon, image, imageAlt } = FLAGSHIP;
  const rootRef = useRef<HTMLElement>(null);
  const resumeTimer = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (reduced) {
      setInView(true);
      setActiveIndex(capabilities.length - 1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [capabilities.length, reduced]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (reduced || !inView || paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % capabilities.length);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [capabilities.length, inView, paused, reduced]);

  const selectCapability = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setPaused(false);
    }, RESUME_MS);
  };

  const displayIndex = reduced ? capabilities.length - 1 : activeIndex;
  const activeCap = capabilities[displayIndex] ?? capabilities[0];
  const progressPct = ((displayIndex + 1) / capabilities.length) * 100;

  return (
    <section
      ref={rootRef}
      className={[styles.section, inView ? styles.sectionActive : ''].filter(Boolean).join(' ')}
      aria-labelledby="flagship-heading"
    >
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.gridLines} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            Flagship app
          </p>

          <div className={styles.titleRow}>
            <span className={styles.iconWrap}>
              <span className={styles.iconRing} aria-hidden="true" />
              <Image src={icon} alt="" width={56} height={56} className={styles.icon} />
            </span>
            <div>
              <h2 id="flagship-heading" className={styles.name}>
                {name}
              </h2>
              <p className={styles.audience}>{audience}</p>
            </div>
          </div>

          <div className={styles.progress} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${String(progressPct)}%` }} />
          </div>

          <div className={styles.capabilitiesWrap}>
            <span className={styles.capTrack} aria-hidden="true">
              <span className={styles.capTrackFill} style={{ height: `${String(progressPct)}%` }} />
            </span>

            <ul
              className={styles.capabilities}
              aria-live="polite"
              onMouseEnter={() => {
                setPaused(true);
              }}
              onMouseLeave={() => {
                setPaused(false);
              }}
            >
              {capabilities.map((item, index) => {
                const Icon = item.Icon;
                const isActive = index === displayIndex;
                const isPast = index < displayIndex;

                return (
                  <li key={item.id} style={{ ['--delay' as string]: `${String(index * 60)}ms` }}>
                    <button
                      type="button"
                      className={[
                        styles.capability,
                        isActive ? styles.capabilityActive : '',
                        isPast ? styles.capabilityPast : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => {
                        selectCapability(index);
                      }}
                    >
                      <span className={styles.capabilityIcon} aria-hidden="true">
                        <span className={styles.capabilityHalo} />
                        <Icon className={styles.capabilityLucide} strokeWidth={1.7} />
                      </span>
                      <span className={styles.capabilityText}>
                        <span className={styles.capabilityHead}>
                          <span className={styles.capabilityLabel}>{item.label}</span>
                          {isActive ? (
                            <span className={styles.capabilityIndex}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          ) : null}
                        </span>
                        <span className={styles.capabilityDetail}>{item.detail}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Link href={cta.href} className={styles.cta} target="_blank" rel="noopener noreferrer">
            {cta.label}
            <ArrowRight className={styles.ctaArrow} aria-hidden />
          </Link>
        </div>

        <div className={styles.visual}>
          <span className={styles.glow} aria-hidden="true" />
          <span className={styles.orbit} aria-hidden="true" />
          <span className={styles.orbitDelay} aria-hidden="true" />

          <div className={styles.mediaShell}>
            <Image
              src={image}
              alt={imageAlt}
              width={1672}
              height={941}
              className={styles.image}
              sizes="(min-width: 1024px) 52vw, 94vw"
            />
            <span className={styles.scan} aria-hidden="true" />

            {HOTSPOTS.map((spot) => {
              const lit = (spot.caps as readonly string[]).includes(activeCap.id);
              return (
                <span
                  key={spot.id}
                  className={[styles.hotspot, lit ? styles.hotspotLit : '']
                    .filter(Boolean)
                    .join(' ')}
                  style={{ left: spot.left, top: spot.top }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
