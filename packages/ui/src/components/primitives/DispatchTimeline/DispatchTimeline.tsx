import type { CSSProperties } from 'react';

import { cn } from '../../../utils/cn';
import { CircleCheckIconGlyph } from '../icons/CircleCheckIconGlyph';

import type {
  AlDispatchTimelineActiveGlyph,
  AlDispatchTimelineProps,
  AlDispatchTimelineStep,
  AlDispatchTimelineVariant,
} from './DispatchTimeline.types';
import './DispatchTimeline.css';

const PARK_ME_CONNECTORS = [40, 34, 40, 34, 40];
/** Figma 871:2151 · 849:321 — 18px glyph + 32px rail = 50px step pitch */
const SOS_CONNECTORS = [32, 32, 32, 32, 32, 32, 32, 32, 32];
const CONTACTS_CONNECTORS = [32, 32];

function variantMetrics(variant: AlDispatchTimelineVariant) {
  if (variant === 'sos') {
    return {
      glyph: 18,
      activeGlyph: 11,
      halo: 24,
      haloBlur: 2,
      haloOffset: 0,
      labelSize: 14,
      labelLine: 17,
      subtitleSize: 12,
      subtitleLine: 15,
      copyGap: 2,
      stepMinHeight: 50,
    };
  }

  if (variant === 'contacts') {
    return {
      glyph: 24,
      activeGlyph: 14,
      halo: 36,
      haloBlur: 3,
      haloOffset: -6,
      labelSize: 15,
      labelLine: 18,
      subtitleSize: 13,
      subtitleLine: 16,
      copyGap: 4,
      stepMinHeight: 56,
    };
  }

  return {
    glyph: 24,
    activeGlyph: 14,
    halo: 36,
    haloBlur: 3,
    haloOffset: -6,
    labelSize: 15,
    labelLine: 18,
    subtitleSize: 13,
    subtitleLine: 16,
    copyGap: 4,
    stepMinHeight: 64,
  };
}

function defaultConnectorHeight(variant: AlDispatchTimelineVariant, index: number): number {
  if (variant === 'sos') {
    return SOS_CONNECTORS[index] ?? 32;
  }
  if (variant === 'contacts') {
    return CONTACTS_CONNECTORS[index] ?? 32;
  }
  return PARK_ME_CONNECTORS[index] ?? 34;
}

function CompleteGlyph({ size }: { size: number }) {
  return <CircleCheckIconGlyph size={size} />;
}

function ActiveGlyph({
  name,
  size,
}: {
  name: AlDispatchTimelineActiveGlyph;
  size: number;
}) {
  switch (name) {
    case 'phone':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="al-dispatch-timeline__active-glyph-icon"
        >
          <path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'activity':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="al-dispatch-timeline__active-glyph-icon"
        >
          <path
            d="M22 12h-4l-3 9L9 3l-3 9H2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'triangle-alert':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="al-dispatch-timeline__active-glyph-icon"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9v4M12 17h.01"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'shield-check':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="al-dispatch-timeline__active-glyph-icon"
        >
          <path
            d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V6C4 5.73478 4.10536 5.48043 4.29289 5.29289C4.48043 5.10536 4.73478 5 5 5C7 5 9.5 3.8 11.24 2.28C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.28C14.51 3.81 17 5 19 5C19.2652 5 19.5196 5.10536 19.7071 5.29289C19.8946 5.48043 20 5.73478 20 6V13Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function StepGlyph({
  step,
  metrics,
}: {
  step: AlDispatchTimelineStep;
  metrics: ReturnType<typeof variantMetrics>;
}) {
  if (step.state === 'complete') {
    return <CompleteGlyph size={metrics.glyph} />;
  }

  if (step.state === 'active' || step.state === 'error') {
    return (
      <>
        <span
          className="al-dispatch-timeline__halo"
          style={{
            width: metrics.halo,
            height: metrics.halo,
          }}
          aria-hidden
        />
        <span
          className="al-dispatch-timeline__glyph-disc"
          style={{ width: metrics.glyph, height: metrics.glyph }}
          aria-hidden
        >
          <ActiveGlyph name={step.activeGlyph ?? 'shield-check'} size={metrics.activeGlyph} />
        </span>
      </>
    );
  }

  return (
    <span
      className="al-dispatch-timeline__glyph-pending"
      style={{ width: metrics.glyph, height: metrics.glyph }}
      aria-hidden
    />
  );
}

/** Figma CC tracker — 982:2387 · 931:2270 · 1153:2542. */
export function AlDispatchTimeline({
  steps,
  variant = 'park-me',
  className,
}: AlDispatchTimelineProps) {
  const metrics = variantMetrics(variant);

  return (
    <ol
      className={cn('al-dispatch-timeline', `al-dispatch-timeline--${variant}`, className)}
      aria-label="Status progress"
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const connectorHeight =
          step.connectorHeight ?? defaultConnectorHeight(variant, index);
        const connectorComplete = step.state === 'complete';

        return (
          <li
            key={step.id}
            className={cn(
              'al-dispatch-timeline__step',
              `al-dispatch-timeline__step--${step.state}`,
            )}
            style={
              {
                minHeight: metrics.stepMinHeight,
                '--step-index': index,
              } as CSSProperties
            }
          >
            <div className="al-dispatch-timeline__rail">
              <span
                className="al-dispatch-timeline__glyph"
                style={{ width: metrics.glyph, height: metrics.glyph }}
              >
                <StepGlyph step={step} metrics={metrics} />
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    'al-dispatch-timeline__connector',
                    connectorComplete && 'al-dispatch-timeline__connector--complete',
                  )}
                  style={{ height: connectorHeight }}
                  aria-hidden
                />
              ) : null}
            </div>
            <div
              className="al-dispatch-timeline__copy"
              style={{ gap: metrics.copyGap }}
            >
              <p
                className="al-dispatch-timeline__label"
                style={{
                  fontSize: metrics.labelSize,
                  lineHeight: `${String(metrics.labelLine)}px`,
                }}
              >
                {step.label}
              </p>
              <p
                className="al-dispatch-timeline__subtitle"
                style={{
                  fontSize: metrics.subtitleSize,
                  lineHeight: `${String(metrics.subtitleLine)}px`,
                }}
              >
                {step.subtitle}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

