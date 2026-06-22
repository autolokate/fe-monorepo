import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ABOUT_HERO_COPY,
  ABOUT_HERO_FEATURES,
  ABOUT_HERO_STATS,
} from "./constants";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="about-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.mainRow}>
          <div className={styles.copy}>
            <span className={styles.badge}>{ABOUT_HERO_COPY.badge}</span>

            <h1 id="about-hero-heading" className={styles.headline}>
              {ABOUT_HERO_COPY.headline}
            </h1>

            <p className={styles.subheading}>{ABOUT_HERO_COPY.subheading}</p>

            <div className={styles.ctas}>
              <Button
                size="lg"
                asChild
                className="border-transparent bg-white px-7 text-[#0a0a0a] shadow-none hover:bg-zinc-100"
              >
                <Link href={ABOUT_HERO_COPY.primaryCta.href}>
                  {ABOUT_HERO_COPY.primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/55 bg-transparent px-7 text-white hover:border-white hover:bg-white/10 hover:text-white"
              >
                <Link href={ABOUT_HERO_COPY.secondaryCta.href}>
                  {ABOUT_HERO_COPY.secondaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <ul className={styles.features} aria-label="Platform capabilities">
            {ABOUT_HERO_FEATURES.map(({ title, body, Icon }) => (
              <li key={title} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className={styles.featureTitle}>{title}</p>
                  <p className={styles.featureBody}>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.statsBar}>
          <ul className={styles.statsList}>
            {ABOUT_HERO_STATS.map(({ value, label, Icon }) => (
              <li key={label} className={styles.stat}>
                <span className={styles.statIcon} aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
