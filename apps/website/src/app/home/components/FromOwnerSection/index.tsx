import { Quote, UserRound, UsersRound } from 'lucide-react';
import { FROM_OWNER_COPY, FROM_OWNER_SECTION_ID } from './constants';
import styles from './index.module.css';

export function FromOwnerSection() {
  const {
    eyebrowLabel,
    headlineLine1,
    headlineLine2Prefix,
    headlineEmphasis,
    headlineLine2Suffix,
    body,
    pullQuote,
    floatingQuote,
    founderName,
    founderRole,
    stat,
  } = FROM_OWNER_COPY;

  return (
    <section
      id={FROM_OWNER_SECTION_ID}
      aria-labelledby="from-owner-heading"
      className={`${styles.section} relative isolate z-[1] overflow-hidden text-foreground`}
    >
      <div className={styles.bgPlate} aria-hidden />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-x-12 lg:px-8 lg:py-16">
        {/* Intro copy */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-start">
          <span
            className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
          >
            {eyebrowLabel}
          </span>

          <h2
            id="from-owner-heading"
            className="font-display mt-5 text-balance text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            {headlineLine1}
            <br />
            {headlineLine2Prefix}
            <span className={styles.accent}>{headlineEmphasis}</span>
            {headlineLine2Suffix}
          </h2>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            {body}
          </p>
        </div>

        {/* Founder visual + floating cards */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center">
          <div className={styles.visual}>
            <figure className={styles.floatQuote}>
              <span className={styles.floatQuoteBadge} aria-hidden>
                <Quote className="h-3.5 w-3.5" strokeWidth={0} fill="currentColor" />
              </span>
              <blockquote className="text-sm font-medium leading-snug text-foreground">
                {floatingQuote}
              </blockquote>
            </figure>

            <div className={styles.floatStat}>
              <span className={styles.floatStatIcon} aria-hidden>
                <UsersRound className="h-5 w-5 stroke-[1.75]" />
              </span>
              <div className="min-w-0">
                <p
                  className={`${styles.accent} font-display text-2xl font-bold leading-none tracking-tight`}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pull quote + founder attribution */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-end">
          <figure>
            <div className={styles.pullQuote}>
              <span className={styles.pullQuoteBadge} aria-hidden>
                <Quote className="h-5 w-5" strokeWidth={0} fill="currentColor" />
              </span>
              <blockquote className="text-base font-medium leading-relaxed text-foreground sm:text-lg">
                {pullQuote}
              </blockquote>
            </div>

            <figcaption className="mt-6 flex items-center gap-3">
              <span className={styles.founderAvatar} aria-hidden>
                <UserRound className="h-4 w-4 stroke-[1.75]" />
              </span>
              <span className="text-sm">
                <span className="font-bold text-foreground">{founderName}</span>
                <span className={`${styles.accent} mx-2`} aria-hidden>
                  &bull;
                </span>
                <span className="text-muted-foreground">{founderRole}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
