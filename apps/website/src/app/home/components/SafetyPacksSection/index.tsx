import { Check } from 'lucide-react';
import { SAFETY_PACKS_COPY, SAFETY_PACKS_SECTION_ID } from './constants';
import { PlanCarousel } from './PlanCarousel';
import styles from './index.module.css';

export function SafetyPacksSection() {
  return (
    <section
      id={SAFETY_PACKS_SECTION_ID}
      aria-labelledby="safety-packs-heading"
      className="relative isolate z-[1] scroll-mt-16 overflow-hidden bg-background py-16 sm:scroll-mt-20 sm:py-20 lg:py-24"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 max-w-2xl">
          <span
            className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
          >
            {SAFETY_PACKS_COPY.eyebrow}
          </span>
          <h2
            id="safety-packs-heading"
            className="font-display mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
          >
            {SAFETY_PACKS_COPY.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-[1.05rem]">
            {SAFETY_PACKS_COPY.subheading}
          </p>
        </div>

        <PlanCarousel />

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
          {SAFETY_PACKS_COPY.footnotes.map((note, index) => (
            <li key={note} className="flex items-center gap-2.5">
              {index > 0 ? (
                <span aria-hidden className="text-border">
                  ·
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Check
                  className={`${styles.accent} h-3.5 w-3.5 shrink-0`}
                  strokeWidth={2.5}
                  aria-hidden
                />
                {note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
