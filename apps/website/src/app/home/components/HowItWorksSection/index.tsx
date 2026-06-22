import { Fragment } from "react";
import { ChevronRight, Pointer } from "lucide-react";
import { HOW_IT_WORKS_COPY, HOW_IT_WORKS_STEPS } from "./constants";
import { StepCard } from "./StepCard";

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="relative isolate z-[1] bg-background pt-16 pb-4 sm:pt-20 sm:pb-5 lg:pt-24 lg:pb-6"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Pointer className="h-3 w-3" aria-hidden />
          {HOW_IT_WORKS_COPY.eyebrow}
        </span>
        <h2
          id="how-it-works-heading"
          className="font-display mt-5 max-w-2xl text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
        >
          {HOW_IT_WORKS_COPY.headlineLine1}
          <br />
          {HOW_IT_WORKS_COPY.headlineLine2}
        </h2>

        <ol className="relative z-10 mt-10 flex flex-col gap-6 sm:mt-11 lg:mt-12 lg:flex-row lg:items-stretch lg:gap-0">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Fragment key={step.id}>
              <li className="min-w-0 flex-1">
                <StepCard step={step} />
              </li>
              {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                <li
                  aria-hidden
                  className="hidden shrink-0 list-none items-center justify-center px-1.5 lg:flex xl:px-2.5"
                >
                  <ChevronRight className="h-5 w-5 text-border" strokeWidth={1.75} />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
}
