import { BUILT_FOR_INDIA_CARDS, BUILT_FOR_INDIA_COPY } from "./constants";
import styles from "./index.module.css";

export function BuiltForIndiaSection() {
  const {
    eyebrow,
    headlineLine1,
    headlineLine2,
    subheadingLine1,
    subheadingLine2,
  } = BUILT_FOR_INDIA_COPY;

  return (
    <section
      aria-labelledby="built-for-india-heading"
      className={`${styles.section} relative z-[1] text-foreground`}
    >
      <div className={styles.backgroundVisual} aria-hidden />
      <div className={styles.scrim} aria-hidden />

      <div className={styles.content}>
        <div className={styles.text}>
          <p
            className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
          >
            {eyebrow}
          </p>

          <h2
            id="built-for-india-heading"
            className="font-display mt-4 text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.75rem]"
          >
            {headlineLine1}
            <br />
            {headlineLine2}
            <span className={styles.accent}>.</span>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subheadingLine1}
            <br />
            {subheadingLine2}
          </p>

          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {BUILT_FOR_INDIA_CARDS.map(({ title, body, Icon }) => (
              <li key={title} className="min-w-0 sm:flex-1 sm:max-w-[15rem]">
                <article
                  className={`${styles.card} flex items-center gap-3.5 rounded-2xl px-4 py-3.5 sm:px-5`}
                >
                  <span
                    className={`${styles.iconBadge} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 stroke-[1.75]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold leading-snug text-foreground">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
