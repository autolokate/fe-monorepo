import { cn } from '../../../utils/cn';

import type { AlStepProgressProps } from './StepProgress.types';
import './StepProgress.css';

export function AlStepProgress({
  step,
  total = 5,
  label,
  showMeta = false,
  showCount = true,
  className,
  ...props
}: AlStepProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeStep = Math.min(Math.max(0, step), safeTotal);
  const segments = Array.from({ length: safeTotal }, (_, index) => index + 1);

  return (
    <div
      className={cn('al-step-progress', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeStep}
      aria-label={label ?? `Step ${String(safeStep)} of ${String(safeTotal)}`}
      {...props}
    >
      {showMeta && (label || safeTotal > 1) ? (
        <div className="al-step-progress__meta">
          {label ? <span className="al-step-progress__label">{label}</span> : <span />}
          {showCount ? (
            <span className="al-step-progress__count">
              {safeStep}/{safeTotal}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="al-step-progress__track" aria-hidden>
        {segments.map((segment) => (
          <span
            key={segment}
            className={cn('al-step-progress__segment', segment <= safeStep && 'is-complete')}
          />
        ))}
      </div>
    </div>
  );
}
