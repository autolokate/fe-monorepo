import Image from 'next/image';
import { WHY_AUTOLOKATE_BACKGROUND, WHY_AUTOLOKATE_COPY, WHY_HIGHLIGHTS } from './constants';
import { HighlightCard } from './HighlightCard';
import styles from './index.module.css';

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
        <div className="max-w-2xl">
          <span
            className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
          >
            {WHY_AUTOLOKATE_COPY.eyebrow}
          </span>
          <h2
            id="why-autolokate-heading"
            className="font-display mt-4 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
          >
            {WHY_AUTOLOKATE_COPY.headlinePrefix}
            <span className={styles.accent}>{WHY_AUTOLOKATE_COPY.headlineEmphasis}</span>
            {WHY_AUTOLOKATE_COPY.headlineSuffix}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            {WHY_AUTOLOKATE_COPY.description}
          </p>
        </div>

        <ul className="relative z-10 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {WHY_HIGHLIGHTS.map((highlight) => (
            <li key={highlight.id} className="relative z-10 min-w-0">
              <HighlightCard highlight={highlight} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
