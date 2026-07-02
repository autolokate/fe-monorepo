import {
  TESTIMONIALS_COPY,
  TESTIMONIALS_SECTION_ID,
  TESTIMONIAL_STATS,
} from "./constants";
import { TestimonialCarousel } from "./TestimonialCarousel";
import styles from "./index.module.css";

export function TestimonialsSection() {
  const { eyebrow, headlinePrefix, headlineEmphasis, headlineSuffix, subheading, trustline } =
    TESTIMONIALS_COPY;

  return (
    <section
      id={TESTIMONIALS_SECTION_ID}
      aria-labelledby="testimonials-heading"
      className="relative isolate z-[1] scroll-mt-16 overflow-hidden bg-background py-16 text-foreground sm:scroll-mt-20 sm:py-20 lg:py-24"
    >
      <div className={styles.bgPlate} aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — top-left, matching the other home sections */}
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-center gap-4">
            <span
              className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
            >
              {eyebrow}
            </span>
            <span aria-hidden className="hidden h-px w-12 bg-border sm:block" />
          </div>

          <h2
            id="testimonials-heading"
            className="font-display mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
          >
            {headlinePrefix}
            <span className={styles.accent}>{headlineEmphasis}</span>
            {headlineSuffix}
          </h2>

          <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            {subheading}
          </p>
        </div>

        {/* Testimonial carousel */}
        <TestimonialCarousel />

        {/* Stats bar */}
        <dl
          className={`${styles.statsBar} mt-12 grid grid-cols-3 gap-0 rounded-3xl px-2 py-5 sm:px-8 sm:py-6 lg:mt-14`}
        >
          {TESTIMONIAL_STATS.map(({ id, value, label, Icon }) => (
            <div
              key={id}
              className={`${styles.stat} flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:justify-center sm:gap-3.5 sm:text-left`}
            >
              <span className={styles.statIcon} aria-hidden>
                <Icon className="h-4 w-4 stroke-[1.75] sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <dt className="font-display text-lg font-bold leading-none tracking-tight text-foreground sm:text-2xl">
                  {value}
                </dt>
                <dd className="mt-1 text-[11px] leading-tight text-muted-foreground sm:text-sm">
                  {label}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {/* Trust line */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span aria-hidden className="h-px w-8 bg-border sm:w-12" />
          <p className="text-center text-xs font-medium text-muted-foreground sm:text-sm">
            {trustline}
          </p>
          <span aria-hidden className="h-px w-8 bg-border sm:w-12" />
        </div>
      </div>
    </section>
  );
}
