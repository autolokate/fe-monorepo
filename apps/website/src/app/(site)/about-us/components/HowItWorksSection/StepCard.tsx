import { cn } from '@/lib/utils';
import type { CrashToCareStep } from './types';

interface StepCardProps {
  step: CrashToCareStep;
  className?: string;
}

export function StepCard({ step, className }: StepCardProps) {
  const { title, body, Icon, step: stepNumber, highlighted } = step;
  const stepLabel = String(stepNumber).padStart(2, '0');

  return (
    <article
      className={cn(
        'flex w-full flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-[18px] lg:w-[240px] lg:max-w-[260px] lg:shrink-0',
        highlighted
          ? 'border-[color-mix(in_srgb,var(--al-signal-green)_35%,transparent)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color-mix(in_srgb,var(--al-signal-green)_25%,transparent)]'
          : 'border-black/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--al-signal-green)_16%,var(--background))] text-[var(--al-signal-green)]"
          aria-hidden
        >
          <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
        </span>
        <span className="text-xs font-semibold tabular-nums tracking-wide text-[var(--al-signal-green)]">
          {stepLabel}
        </span>
      </div>

      <h3 className="mt-3 text-[0.9375rem] font-bold leading-snug text-foreground">{title}</h3>

      <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{body}</p>
    </article>
  );
}
