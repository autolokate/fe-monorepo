'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { EXPERIENCE_FLOW, FLOW_STEPS } from './constants';
import styles from './experience-flow.module.css';

const STEP_MS = 1700;
const RESUME_MS = 4200;

/** Soft hotspot accents aligned to callouts in crash-to-care.png */
const HOTSPOTS = [
  { id: 'crash', left: '14%', top: '18%', steps: [1, 2] },
  { id: 'family', left: '12%', top: '48%', steps: [3] },
  { id: 'phone', left: '48%', top: '42%', steps: [0, 2, 4, 5, 7] },
  { id: 'qr', left: '78%', top: '22%', steps: [6, 7] },
] as const;

export function ExperienceFlow() {
  const { eyebrow, headline, headlineLine2, body } = EXPERIENCE_FLOW;
  const rootRef = useRef<HTMLElement>(null);
  const resumeTimer = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

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
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (reduced || !inView || paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % FLOW_STEPS.length);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [inView, paused, reduced]);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setPaused(false);
    }, RESUME_MS);
  };

  const displayIndex = reduced ? FLOW_STEPS.length - 1 : activeIndex;
  const activeStep = FLOW_STEPS[displayIndex] ?? FLOW_STEPS[0];
  const fillPct = (displayIndex / Math.max(FLOW_STEPS.length - 1, 1)) * 100;
  const phaseClass =
    displayIndex <= 1
      ? styles.phaseImpact
      : displayIndex <= 4
        ? styles.phaseDispatch
        : styles.phaseCare;

  return (
    <section
      ref={rootRef}
      className={[styles.section, inView ? styles.sectionActive : '', phaseClass]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="flow-heading"
    >
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.stage}>
          <div className={styles.copyCol}>
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowLine} aria-hidden="true" />
                {eyebrow}
              </p>
              <h2 id="flow-heading" className={styles.headline}>
                {headline}
                <br />
                <span className={styles.headlineMuted}>{headlineLine2}</span>
              </h2>
              <p className={styles.body}>{body}</p>
            </header>

            <div className={styles.moment} aria-live="polite">
              <div className={styles.momentTop}>
                <span className={styles.momentIcon} aria-hidden="true">
                  <span className={styles.momentRing} />
                  <span className={styles.momentRingDelay} />
                  <span className={styles.momentIconStack}>
                    {FLOW_STEPS.map((step, index) => {
                      const Icon = step.Icon;
                      return (
                        <Icon
                          key={step.id}
                          className={[
                            styles.momentLucide,
                            index === displayIndex ? styles.momentLucideActive : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          strokeWidth={1.55}
                        />
                      );
                    })}
                  </span>
                </span>
                <div className={styles.momentMeta}>
                  <span className={styles.momentIndex} aria-hidden="true">
                    {String(displayIndex + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.momentOf}>/ {FLOW_STEPS.length}</span>
                </div>
              </div>

              <div className={styles.momentCopy}>
                <h3 className={styles.momentTitle}>{activeStep.label}</h3>
                <p className={styles.momentDetail}>{activeStep.detail}</p>
              </div>
            </div>
          </div>

          <div className={styles.visualCol}>
            <div className={styles.visualFrame}>
              <Image
                src={MARKETING_STORY_IMAGES.productsCrashToCare}
                alt="Autolokate app with crash detection, family alerts, Smart QR, and everyday tools connected around the phone"
                width={1672}
                height={941}
                className={styles.visualImage}
                sizes="(max-width: 1024px) 92vw, 52vw"
                priority={false}
              />
              <span className={styles.visualBloom} aria-hidden="true" />

              {HOTSPOTS.map((spot) => {
                const lit = (spot.steps as readonly number[]).includes(displayIndex);
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

        <div
          className={styles.journey}
          aria-label="Crash response sequence"
          onMouseEnter={() => {
            setPaused(true);
          }}
          onMouseLeave={() => {
            setPaused(false);
          }}
        >
          <div className={styles.journeyTrack} aria-hidden="true">
            <div className={styles.journeyBase} />
            <div className={styles.journeyFill} style={{ width: `${String(fillPct)}%` }}>
              <span className={styles.journeyPulse} />
            </div>
          </div>

          <ol className={styles.nodes}>
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.Icon;
              const isActive = index === displayIndex;
              const isPast = index < displayIndex;
              const connectorLit = index < displayIndex;

              return (
                <li key={step.id} className={styles.nodeItem}>
                  {index > 0 ? (
                    <span
                      className={[styles.connector, connectorLit ? styles.connectorLit : '']
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    />
                  ) : null}

                  <button
                    type="button"
                    className={[
                      styles.nodeBtn,
                      isActive ? styles.nodeBtnActive : '',
                      isPast ? styles.nodeBtnPast : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${String(index + 1)}: ${step.label}`}
                    onClick={() => {
                      selectStep(index);
                    }}
                  >
                    <span className={styles.nodeDot} aria-hidden="true">
                      <span className={styles.nodeHalo} />
                      <Icon className={styles.nodeLucide} strokeWidth={1.7} />
                    </span>
                    <span className={styles.nodeLabel}>{step.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
