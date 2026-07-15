import type { CrashToCareStep } from './types';
import { StepCard } from './StepCard';

interface MobileTimelineProps {
  steps: CrashToCareStep[];
}

export function MobileTimeline({ steps }: MobileTimelineProps) {
  return (
    <ol className="relative list-none space-y-4 pl-1">
      <span aria-hidden className="absolute bottom-3 left-[1.375rem] top-3 w-px bg-black/20" />

      {steps.map((step) => (
        <li key={step.id} className="relative pl-10">
          <span
            aria-hidden
            className="absolute left-[1.125rem] top-[1.375rem] z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--al-signal-green)] ring-4 ring-background"
          />
          <StepCard step={step} className="lg:w-full lg:max-w-none" />
        </li>
      ))}
    </ol>
  );
}
