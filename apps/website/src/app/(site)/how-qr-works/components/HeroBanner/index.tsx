import Link from "next/link";
import { CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroPerks, SHOP_HERO_COPY, ShoppingCart } from "./constants";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="shop-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.badge}>{SHOP_HERO_COPY.badge}</span>

          <h1 id="shop-hero-heading" className={styles.headline}>
            {SHOP_HERO_COPY.headline}
            <br />
            {SHOP_HERO_COPY.headlineAccent}
          </h1>

          <p className={styles.subheading}>{SHOP_HERO_COPY.subheading}</p>

          <ul className={styles.perks}>
            {heroPerks.map(({ Icon, label }) => (
              <li key={label} className={styles.perk}>
                <span className={styles.perkIcon} aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={styles.perkLabel}>{label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.ctas}>
            <Button
              size="lg"
              asChild
              className="border-transparent bg-white px-7 text-[#0a0a0a] shadow-none hover:bg-zinc-100"
            >
              <Link href={SHOP_HERO_COPY.primaryCta.href}>
                <ShoppingCart className="h-4 w-4" aria-hidden />
                {SHOP_HERO_COPY.primaryCta.label}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/55 bg-transparent px-7 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Link href={SHOP_HERO_COPY.secondaryCta.href}>
                <CirclePlay className="h-4 w-4" aria-hidden />
                {SHOP_HERO_COPY.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
