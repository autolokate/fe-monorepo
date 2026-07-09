import { cn } from '../../../utils/cn';

import type { AlScreenSpinnerProps } from './ScreenSpinner.types';
import './ScreenSpinner.css';

const SIZE_MAP = {
  lg: 60,
  md: 40,
} as const;

/** Figma R04/R09 — green stroke ring loader (R09 animates a partial arc). */
export function AlScreenSpinner({
  className,
  size = 'lg',
  animated = false,
  tone = 'default',
  'aria-label': ariaLabel = 'Loading',
}: AlScreenSpinnerProps) {
  const dimension = SIZE_MAP[size];
  const strokeWidth = size === 'lg' ? 4 : 3;
  const radius = (dimension - strokeWidth) / 2;
  const center = dimension / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className={cn(
        'al-screen-spinner',
        `al-screen-spinner--${size}`,
        tone === 'emergency' && 'al-screen-spinner--emergency',
        animated && 'al-screen-spinner--animated',
        className,
      )}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${String(dimension)} ${String(dimension)}`}
      role="status"
      aria-label={ariaLabel}
    >
      {animated ? (
        <>
          <circle
            className="al-screen-spinner__track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
          />
          <circle
            className="al-screen-spinner__arc"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${String(circumference * 0.72)} ${String(circumference * 0.28)}`}
            transform={`rotate(-90 ${String(center)} ${String(center)})`}
          />
        </>
      ) : (
        <circle
          className="al-screen-spinner__arc"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
      )}
    </svg>
  );
}
