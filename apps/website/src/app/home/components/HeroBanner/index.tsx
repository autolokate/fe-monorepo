import Link from "next/link";
import { GitCompare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_COPY, HERO_FEATURES } from "./constants";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgBase} />
        <div className={styles.bgCarLift} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-hero-heading" className={styles.headline}>
            {HERO_COPY.headline}
          </h1>

          <p className={styles.subheading}>{HERO_COPY.subheading}</p>

          <div className={styles.ctas}>
            <Button
              size="lg"
              asChild
              className="border-transparent bg-white px-7 text-[#0a0a0a] shadow-none hover:bg-zinc-100"
            >
              <Link href={HERO_COPY.primaryCta.href}>
                <Shield className="h-4 w-4" aria-hidden />
                {HERO_COPY.primaryCta.label}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/55 bg-transparent px-7 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Link href={HERO_COPY.secondaryCta.href}>
                <GitCompare className="h-4 w-4" aria-hidden />
                {HERO_COPY.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>

        <ul className={styles.features}>
          {HERO_FEATURES.map(({ title, body, Icon }) => (
            <li key={title} className={styles.feature}>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] text-white"
                aria-hidden
              >
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
    </section>
  );
}
