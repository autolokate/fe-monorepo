import Image from "next/image";
import { Shield } from "lucide-react";
import {
  SAFETY_PACKS_BACKGROUND,
  SAFETY_PACKS_COPY,
  SAFETY_PACKS_SECTION_ID,
  SAFETY_PLANS,
} from "./constants";
import { PlanCard } from "./PlanCard";

export function SafetyPacksSection() {
  return (
    <section
      id={SAFETY_PACKS_SECTION_ID}
      aria-labelledby="safety-packs-heading"
      className="relative isolate z-[1] scroll-mt-16 overflow-hidden bg-background py-16 sm:scroll-mt-20 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src={SAFETY_PACKS_BACKGROUND}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[85%_center] opacity-100 lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-20% via-background/94 via-55% to-background/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
              <Shield className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
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

          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm lg:mt-8 lg:shrink-0">
            <Shield className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
            {SAFETY_PACKS_COPY.headerPill}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {SAFETY_PLANS.map((plan) => (
            <li key={plan.id} className="min-w-0">
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
