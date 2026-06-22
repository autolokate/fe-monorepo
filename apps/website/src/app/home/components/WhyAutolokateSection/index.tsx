import Image from "next/image";
import { WHY_AUTOLOKATE_BACKGROUND, WHY_AUTOLOKATE_COPY, WHY_HIGHLIGHTS } from "./constants";
import { HighlightCard } from "./HighlightCard";

export function WhyAutolokateSection() {
  return (
    <section
      aria-labelledby="why-autolokate-heading"
      className="relative isolate z-[1] overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src={WHY_AUTOLOKATE_BACKGROUND}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[85%_center] lg:object-[90%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-20% via-background/88 via-45% to-background/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {WHY_AUTOLOKATE_COPY.eyebrow}
            </span>
            <h2
              id="why-autolokate-heading"
              className="font-display mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
            >
              {WHY_AUTOLOKATE_COPY.headlineLine1}
              <br />
              {WHY_AUTOLOKATE_COPY.headlineLine2}
            </h2>
          </div>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:ml-auto lg:text-right lg:text-[1.05rem]">
            {WHY_AUTOLOKATE_COPY.description}
          </p>
        </div>

        <ul className="relative z-10 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-5 lg:gap-4">
          {WHY_HIGHLIGHTS.map((highlight, index) => (
            <li key={highlight.id} className="relative z-10 min-w-0">
              <HighlightCard
                highlight={highlight}
                className={
                  index === 0
                    ? "border border-black/20 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
