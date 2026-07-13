import {
  CRASH_TO_CARE_COPY,
  CRASH_TO_CARE_ROW_ONE,
  CRASH_TO_CARE_ROW_TWO,
  CRASH_TO_CARE_STEPS,
  HOW_IT_WORKS_SECTION_ID,
} from "./constants";
import { FlowRow } from "./FlowRow";
import { MobileTimeline } from "./MobileTimeline";
import { TabletGrid } from "./TabletGrid";

export function HowItWorksSection() {
  return (
    <section
      id={HOW_IT_WORKS_SECTION_ID}
      aria-labelledby="about-how-it-works-heading"
      className="bg-background py-10 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[0.8rem] font-bold uppercase tracking-[0.18em] text-[var(--al-signal-green)]">
            {CRASH_TO_CARE_COPY.eyebrow}
          </p>
          <h2
            id="about-how-it-works-heading"
            className="font-display mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            {CRASH_TO_CARE_COPY.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            {CRASH_TO_CARE_COPY.subheading}
          </p>
        </header>

        <div className="mt-7 sm:mt-8 lg:mt-9">
          {/* Mobile — vertical timeline */}
          <div className="md:hidden">
            <MobileTimeline steps={CRASH_TO_CARE_STEPS} />
          </div>

          {/* Tablet — 2 cards per row */}
          <div className="hidden md:block lg:hidden">
            <TabletGrid steps={CRASH_TO_CARE_STEPS} />
          </div>

          {/* Desktop — 4 + 3 two-row flow */}
          <div className="hidden flex-col items-center gap-5 lg:flex">
            <FlowRow steps={CRASH_TO_CARE_ROW_ONE} />
            <FlowRow steps={CRASH_TO_CARE_ROW_TWO} />
          </div>
        </div>
      </div>
    </section>
  );
}
