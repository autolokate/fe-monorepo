import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import {
  GETTING_STARTED_COPY,
  GETTING_STARTED_FEATURES,
  GETTING_STARTED_STEPS,
} from "./constants";
import { ProtectionCarousel } from "./ProtectionCarousel";
import styles from "./index.module.css";

export function GettingStartedSection() {
  const {
    eyebrow,
    headlineLine1,
    headlineLine2Prefix,
    headlineEmphasis,
    headlineLine2Suffix,
    subheadline,
  } = GETTING_STARTED_COPY;

  return (
    <section
      aria-labelledby="getting-started-heading"
      className="relative z-[1] overflow-hidden border-t border-border bg-background text-foreground"
    >
      <div className={styles.texture} aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pb-9 sm:pt-16 lg:px-8 lg:pb-10 lg:pt-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-4">
          <span
            className={`${styles.amber} font-mono text-[11px] font-semibold uppercase tracking-[0.32em] sm:text-xs`}
          >
            {eyebrow}
          </span>
          <span aria-hidden className="hidden h-px max-w-[16rem] flex-1 bg-border lg:block" />
        </div>

        {/* Headline + sub */}
        <h2
          id="getting-started-heading"
          className="font-display mt-5 max-w-3xl text-balance text-3xl font-bold leading-[1.06] tracking-tight sm:text-4xl lg:text-[3.25rem]"
        >
          {headlineLine1}
          <br />
          {headlineLine2Prefix}
          <span className={styles.amber}>{headlineEmphasis}</span>
          {headlineLine2Suffix}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subheadline}
        </p>

        {/* Steps — desktop card row */}
        <ol className="mt-10 hidden lg:mt-14 lg:flex lg:items-stretch lg:gap-0">
          {GETTING_STARTED_STEPS.map((step, index) => {
            const { id, step: stepNumber, title, body, Icon } = step;

            return (
              <Fragment key={id}>
                <li className="min-w-0 flex-1">
                  <article className={`${styles.card} flex h-full flex-col rounded-2xl p-5 xl:p-6`}>
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`${styles.iconBadge} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl`}
                        aria-hidden
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <span
                          className={`${styles.amber} block font-mono text-xs font-bold tracking-wider`}
                        >
                          {stepNumber}
                        </span>
                        <h3 className="text-base font-bold leading-snug xl:text-lg">{title}</h3>
                      </div>
                    </div>
                    <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </article>
                </li>

                {index < GETTING_STARTED_STEPS.length - 1 ? (
                  <li
                    aria-hidden
                    className="flex shrink-0 items-center px-2 pt-[2.2rem] xl:px-3"
                  >
                    <span className={styles.connectorLine} />
                    <ChevronRight
                      className={`${styles.amber} -ml-1 h-4 w-4 shrink-0`}
                      strokeWidth={2}
                    />
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>

        {/* Steps — mobile vertical timeline */}
        <ol className="mt-9 flex flex-col sm:mt-10 lg:hidden">
          {GETTING_STARTED_STEPS.map((step, index) => {
            const { id, step: stepNumber, title, body, Icon } = step;
            const isLast = index === GETTING_STARTED_STEPS.length - 1;

            return (
              <li key={id} className={`flex gap-4 ${isLast ? "" : "pb-7"}`}>
                <div className="relative shrink-0">
                  {!isLast ? (
                    <span
                      aria-hidden
                      className={`${styles.spine} absolute bottom-0 left-1/2 top-[3.25rem] -translate-x-1/2`}
                    />
                  ) : null}
                  <span
                    className={`${styles.iconBadge} relative z-10 flex h-12 w-12 items-center justify-center rounded-xl`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`${styles.amber} font-mono text-xs font-bold tracking-wider`}>
                      {stepNumber}
                    </span>
                    <h3 className="text-base font-bold leading-snug">{title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Feature strip */}
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-5 sm:mt-12 lg:mt-14 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-0">
          {GETTING_STARTED_FEATURES.map(({ id, label, Icon }) => (
            <li
              key={id}
              className="flex items-center gap-2.5 lg:px-6 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-border"
            >
              <Icon className={`${styles.amber} h-4 w-4 shrink-0`} strokeWidth={1.9} aria-hidden />
              <span className="text-xs leading-snug text-muted-foreground sm:text-sm">{label}</span>
            </li>
          ))}
        </ul>

        {/* Protection journey carousel */}
        <ProtectionCarousel />
      </div>
    </section>
  );
}
