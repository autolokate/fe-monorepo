import { EXPLORE_AUTOLOKATE_COPY, EXPLORE_SERVICE_CARDS } from "./constants";
import { ServiceCard } from "./ServiceCard";

export function ExploreAutolokateSection() {
  return (
    <section
      aria-labelledby="explore-autolokate-heading"
      className="relative isolate z-[1] bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {EXPLORE_AUTOLOKATE_COPY.eyebrow}
        </span>
        <h2
          id="explore-autolokate-heading"
          className="font-display mt-5 max-w-2xl text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
        >
          {EXPLORE_AUTOLOKATE_COPY.headlineLine1}
          <br />
          {EXPLORE_AUTOLOKATE_COPY.headlineLine2}
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {EXPLORE_SERVICE_CARDS.map((card) => (
            <li key={card.id} className="min-w-0">
              <ServiceCard card={card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
