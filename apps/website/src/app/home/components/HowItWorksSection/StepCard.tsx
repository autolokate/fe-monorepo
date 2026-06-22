import type { HowItWorksStep } from "./types";

interface StepCardProps {
  step: HowItWorksStep;
}

export function StepCard({ step }: StepCardProps) {
  const { title, body, Icon, step: stepNumber } = step;

  return (
    <article className="relative flex h-full flex-col pt-3.5">
      <div
        className="absolute left-1/2 top-0 z-20 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-sm"
        aria-hidden
      >
        {stepNumber}
      </div>

      <div className="flex flex-1 flex-col items-center rounded-2xl border border-border/70 bg-card px-4 pb-5 pt-9 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-5 sm:pb-6 sm:pt-10">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/45 text-foreground"
          aria-hidden
        >
          <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
        </span>
        <h3 className="mt-3.5 text-sm font-bold leading-snug text-foreground sm:text-[0.9375rem]">
          {title}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[12.5px]">
          {body}
        </p>
      </div>
    </article>
  );
}
