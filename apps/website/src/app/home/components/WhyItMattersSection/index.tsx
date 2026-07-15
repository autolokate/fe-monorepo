import { CircleCheck, ShieldAlert } from 'lucide-react';
import { WHY_IT_MATTERS_COPY } from './constants';
import styles from './index.module.css';

export function WhyItMattersSection() {
  const { eyebrow, stat, half, crash, footer } = WHY_IT_MATTERS_COPY;

  return (
    <section
      aria-labelledby="why-it-matters-heading"
      className={`${styles.section} relative z-[1] text-foreground`}
    >
      <div className={styles.backgroundVisual} aria-hidden />

      <div className={styles.radar} aria-hidden>
        <svg className={styles.radarRings} viewBox="0 0 480 480" fill="none">
          <circle cx="240" cy="240" r="44" />
          <circle cx="240" cy="240" r="96" />
          <circle cx="240" cy="240" r="150" />
          <circle cx="240" cy="240" r="202" />
          <circle cx="240" cy="240" r="238" />
        </svg>
        <span className={styles.radarPing} />
        <span className={styles.radarCore} />
        <span className={styles.radarDot} />
      </div>

      <div className={styles.content}>
        <div className={styles.text}>
          <p className={`${styles.accent} text-xs font-semibold uppercase tracking-[0.28em]`}>
            {eyebrow}
          </p>

          <h2
            id="why-it-matters-heading"
            className="mt-4 font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl"
          >
            {stat.value}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{stat.label}</p>

          <div className={`${styles.divider} my-6`} aria-hidden />

          <p className="max-w-md text-base leading-relaxed sm:text-lg">
            {half.lead} <span className={`${styles.accent} font-semibold`}>{half.emphasis}</span>{' '}
            {half.body}
          </p>

          <div
            className={`${styles.highlight} mt-6 flex max-w-xl items-start gap-3 rounded-2xl px-4 py-4 sm:gap-4 sm:px-5`}
          >
            <ShieldAlert
              className={`${styles.accent} mt-0.5 h-5 w-5 shrink-0`}
              strokeWidth={1.7}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-semibold leading-snug text-foreground">{crash.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                <span className={`${styles.accent} font-semibold`}>{crash.brand}</span>
                {crash.body}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck className={`${styles.accent} h-4 w-4 shrink-0`} aria-hidden />
            <span>{footer}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
