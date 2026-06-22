import { features } from "./constants";

const sectionTitle =
  "font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl";

export function WhyOffers() {
  return (
    <section id="offers" className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-10 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-app-soft sm:p-8">
          <span className="block h-1 w-10 rounded-full bg-primary" aria-hidden />
          <h2 className={`${sectionTitle} mt-4`}>Why Autolokate?</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            Vehicle ownership comes with challenges: keeping track of service records, managing
            expenses, coordinating trips, and ensuring someone can step in during an emergency.
            Autolokate addresses these challenges with a calm, owner-first toolkit.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            We put owners first, not user profiles. The platform combines vehicle management,
            community support, trip &amp; expense sharing, and optional emergency contact features
            — all in one privacy-conscious place. Free, simple, and designed to help when you need
            it.
          </p>
        </div>

        <div>
          <h3 className={sectionTitle}>What Autolokate Offers</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Six focused modules — opt into the ones that fit your routine.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border/80 bg-card p-5 shadow-app-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h4 className="mt-4 text-sm font-semibold text-foreground">{title}</h4>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
