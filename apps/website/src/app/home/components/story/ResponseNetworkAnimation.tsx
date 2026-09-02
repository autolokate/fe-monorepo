'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { RESPONSE_NODES } from './constants';
import styles from './response-network-animation.module.css';

const CONNECT_ORDER = ['family', 'ambulance', 'police', 'rsa', 'control'] as const;
const STEP_MS = 950;
const PAUSE_MS = 3400;

type Phase = 'idle' | 'crash' | 'detect' | 'connecting' | 'complete';
type NodeId = (typeof CONNECT_ORDER)[number];

const PHONE_CENTER = { x: 500, y: 330 };

/** Curved paths — aligned to phone rim and marker positions in the 1000×580 viewBox */
const CURVE_PATHS: Record<NodeId, string> = {
  family: 'M 500 192 C 500 168, 500 138, 500 108',
  ambulance: 'M 558 262 C 670 178, 770 125, 838 128',
  police: 'M 558 398 C 685 488, 785 538, 838 528',
  rsa: 'M 442 398 C 315 488, 215 538, 162 528',
  control: 'M 442 262 C 330 178, 230 125, 162 128',
};

const NODE_POSITIONS: Record<(typeof RESPONSE_NODES)[number]['id'], { x: string; y: string }> = {
  family: { x: '50%', y: '0' },
  ambulance: { x: '90%', y: '12%' },
  police: { x: '90%', y: '88%' },
  rsa: { x: '10%', y: '88%' },
  control: { x: '10%', y: '12%' },
};

export function ResponseNetworkAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 'complete' : 'idle');
  const [connectedCount, setConnectedCount] = useState(reduced ? CONNECT_ORDER.length : 0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      setPhase('complete');
      setConnectedCount(CONNECT_ORDER.length);
      return;
    }

    if (!isInView) {
      setPhase('idle');
      setConnectedCount(0);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSequence = () => {
      if (cancelled) return;

      setPhase('crash');
      setConnectedCount(0);

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setPhase('detect');

        timeoutId = setTimeout(() => {
          if (cancelled) return;
          setPhase('connecting');

          let index = 0;
          const connectNext = () => {
            if (cancelled) return;
            index += 1;
            setConnectedCount(index);

            if (index < CONNECT_ORDER.length) {
              timeoutId = setTimeout(connectNext, STEP_MS);
              return;
            }

            setPhase('complete');
            timeoutId = setTimeout(runSequence, PAUSE_MS);
          };

          connectNext();
        }, STEP_MS);
      }, STEP_MS);
    };

    runSequence();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isInView, reduced]);

  const connectedIds = new Set(CONNECT_ORDER.slice(0, connectedCount));
  const isLive = phase === 'connecting' || phase === 'complete';
  const isSos = phase === 'crash' || phase === 'detect';

  return (
    <div
      ref={rootRef}
      className={styles.stage}
      data-phase={phase}
      aria-label="Phone detects crash and connects family, ambulance, police, roadside, and Control Center"
    >
      <svg
        className={styles.lines}
        viewBox="0 0 1000 580"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${gradientId}-hub`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(214, 69, 69, 0.2)" />
            <stop offset="100%" stopColor="rgba(214, 69, 69, 0)" />
          </radialGradient>

          <linearGradient id={`${gradientId}-active`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(125, 212, 160, 0.25)" />
            <stop offset="45%" stopColor="rgba(125, 212, 160, 0.85)" />
            <stop offset="100%" stopColor="rgba(160, 230, 190, 0.95)" />
          </linearGradient>

          <linearGradient id={`${gradientId}-draw`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 200, 140, 0.4)" />
            <stop offset="50%" stopColor="rgba(255, 220, 160, 1)" />
            <stop offset="100%" stopColor="rgba(125, 212, 160, 0.9)" />
          </linearGradient>

          <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {isSos ? (
          <circle
            cx={PHONE_CENTER.x}
            cy={PHONE_CENTER.y}
            r="118"
            fill={`url(#${gradientId}-hub)`}
            className={styles.hubGlow}
          />
        ) : null}

        {CONNECT_ORDER.map((id, index) => {
          const pathD = CURVE_PATHS[id];
          const isActive = connectedIds.has(id);
          const isDrawing = phase === 'connecting' && connectedCount === index + 1;
          const showFlow = isActive && (phase === 'complete' || isDrawing);

          return (
            <g key={id} className={styles.curveGroup}>
              {/* faint track */}
              <path d={pathD} pathLength={1} className={styles.curveTrack} />

              {/* glow underlay */}
              {isActive ? (
                <path
                  d={pathD}
                  pathLength={1}
                  className={styles.curveGlow}
                  style={{ animationDelay: `${String(index * 80)}ms` }}
                />
              ) : null}

              {/* main curve */}
              <path
                d={pathD}
                pathLength={1}
                stroke={isActive && !isDrawing ? `url(#${gradientId}-active)` : undefined}
                className={[
                  styles.curve,
                  isActive ? styles.curveActive : '',
                  isDrawing ? styles.curveDrawing : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--curve-delay': `${String(index * 80)}ms`,
                  } as CSSProperties
                }
              />

              {/* energy pulse traveling along active path */}
              {showFlow && !reduced ? (
                <>
                  <path d={pathD} pathLength={1} className={styles.curveFlow} />
                  <circle r="3.5" className={styles.flowDot}>
                    <animateMotion
                      dur="1.8s"
                      repeatCount="indefinite"
                      path={pathD}
                      begin={`${String(index * 0.15)}s`}
                    />
                  </circle>
                </>
              ) : null}

              {/* node arrival pulse */}
              {isActive ? (
                <circle
                  cx={pathEndPoint(pathD).x}
                  cy={pathEndPoint(pathD).y}
                  r="4"
                  className={styles.nodePulse}
                  style={{ animationDelay: `${String(index * 120)}ms` }}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      <ul className={styles.nodes}>
        {RESPONSE_NODES.map((node, index) => {
          const isConnected = connectedIds.has(node.id);
          const isNext = phase === 'connecting' && CONNECT_ORDER[connectedCount] === node.id;
          const position = NODE_POSITIONS[node.id];

          return (
            <li
              key={node.id}
              className={[
                styles.node,
                node.id === 'family' ? styles.nodeFamily : '',
                isConnected ? styles.nodeConnected : '',
                isNext ? styles.nodeNext : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--delay': `${String(index * 100)}ms`,
                  '--x': position.x,
                  '--y': position.y,
                } as CSSProperties
              }
            >
              <div className={styles.marker}>
                <Image
                  src={node.image}
                  alt=""
                  width={160}
                  height={160}
                  className={styles.markerImage}
                  aria-hidden
                />
                {isConnected ? <span className={styles.markerRing} aria-hidden="true" /> : null}
                {isNext ? <span className={styles.markerPing} aria-hidden="true" /> : null}
              </div>
              <div className={styles.nodeText}>
                <span className={styles.nodeLabel}>{node.label}</span>
                <span className={styles.nodeSub}>{node.sub}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className={[styles.phoneHub, isSos ? styles.phoneSos : '', isLive ? styles.phoneLive : '']
          .filter(Boolean)
          .join(' ')}
      >
        {isSos ? (
          <>
            <span className={styles.sosRing} aria-hidden="true" />
            <span className={styles.sosFlash} aria-hidden="true" />
          </>
        ) : null}
        {isLive && !isSos ? <span className={styles.liveAura} aria-hidden="true" /> : null}

        <Image
          src={MARKETING_STORY_IMAGES.responseNetworkPhone}
          alt="Autolokate app showing SOS crash alert with emergency network activating"
          width={853}
          height={1844}
          priority
          className={styles.phone}
          sizes="(min-width: 1024px) 16rem, 42vw"
        />

        <p className={styles.phoneStatus} aria-live="polite">
          {phase === 'idle' ? (
            'Monitoring every drive'
          ) : phase === 'crash' ? (
            <span className={styles.statusCrash}>SOS — Impact detected</span>
          ) : phase === 'detect' ? (
            <span className={styles.statusCrash}>Confirming incident…</span>
          ) : connectedCount < CONNECT_ORDER.length ? (
            <span className={styles.statusLive}>
              <span className={styles.statusDot} aria-hidden="true" />
              Activating response network
            </span>
          ) : (
            <span className={styles.statusLive}>
              <span className={styles.statusDot} aria-hidden="true" />
              All channels live
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/** Parse last coordinate pair from an SVG path for pulse placement */
function pathEndPoint(d: string): { x: number; y: number } {
  const numbers = d.match(/-?\d+(\.\d+)?/g);
  if (!numbers || numbers.length < 2) return { x: 500, y: 100 };
  return {
    x: Number(numbers[numbers.length - 2]),
    y: Number(numbers[numbers.length - 1]),
  };
}
